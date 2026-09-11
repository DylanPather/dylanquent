<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * What the column allowed before, from the original orders migration.
     * Needed to put the constraint back on rollback.
     */
    private const PREVIOUS_STATUSES = [
        'pending',
        'paid',
        'fulfilled',
        'cancelled',
        'refunded',
        'partially_refunded',
    ];

    /**
     * Hand orders.status over to App\Enums\OrderStatus.
     *
     * The column was declared as a database enum, and its value list had
     * drifted from the code that writes it in both directions: the observer's
     * payment-failure branch watched for 'payment_failed' and the shipping
     * label controller wrote 'shipped', neither of which the column allowed,
     * while the admin status form offered 'processing' for the same reason.
     * Every one of those was a 500 rather than a validation error.
     *
     * Keeping a database enum means a migration every time a status is added,
     * and Laravel cannot even express that on Postgres — an enum ->change()
     * compiles to `alter column ... type varchar(255) check (...)`, which
     * Postgres rejects as a syntax error. So the vocabulary moves into PHP:
     * the column becomes a plain string, Order casts it to OrderStatus (an
     * unknown value throws on write), and the admin form validates against
     * the same enum. OrderStatusTest holds both ends to it.
     */
    public function up(): void
    {
        // Postgres keeps a column's CHECK constraint across a type change, so
        // widening alone would leave the old six values enforced. SQLite
        // rebuilds the table from the new definition and MySQL replaces the
        // native enum outright, so only Postgres needs this.
        foreach ($this->postgresStatusCheckConstraints() as $name) {
            DB::statement('alter table "orders" drop constraint "'.$name.'"');
        }

        Schema::table('orders', function (Blueprint $table) {
            $table->string('status')->default('pending')->change();

            // Why the payment failed, as the gateway reported it. The observer
            // needs to read it on the next tick to tell the customer, and
            // 'notes' is the admin's own free-text field — writing a gateway
            // message there would destroy whatever they had typed.
            $table->string('payment_failure_reason')->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        // 'payment_failed' and 'processing' are outside the old vocabulary, so
        // park those orders somewhere the old constraint accepts first.
        DB::table('orders')
            ->whereIn('status', ['payment_failed', 'processing'])
            ->update(['status' => 'pending']);

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('payment_failure_reason');
        });

        if (DB::getDriverName() === 'pgsql') {
            $values = "'".implode("', '", self::PREVIOUS_STATUSES)."'";

            DB::statement('alter table "orders" add constraint "orders_status_check" check ("status" in ('.$values.'))');

            return;
        }

        Schema::table('orders', function (Blueprint $table) {
            $table->enum('status', self::PREVIOUS_STATUSES)->default('pending')->change();
        });
    }

    /**
     * Names of the CHECK constraints Postgres holds over orders.status.
     *
     * Read out of the catalogue rather than assumed to be orders_status_check:
     * the name depends on how the column was created.
     *
     * @return array<int, string>
     */
    private function postgresStatusCheckConstraints(): array
    {
        if (DB::getDriverName() !== 'pgsql') {
            return [];
        }

        $rows = DB::select(<<<'SQL'
            select con.conname
            from pg_constraint con
            join pg_class rel on rel.oid = con.conrelid
            join pg_namespace nsp on nsp.oid = rel.relnamespace
            join pg_attribute att on att.attrelid = rel.oid and att.attnum = any (con.conkey)
            where con.contype = 'c'
              and rel.relname = 'orders'
              and att.attname = 'status'
              and nsp.nspname = current_schema()
        SQL);

        return array_map(fn ($row) => $row->conname, $rows);
    }
};
