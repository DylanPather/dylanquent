<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Drop idle Postgres backends so their cached query plans go with them.
 *
 * Postgres caches a plan per prepared statement, and Eloquent's queries are
 * `select *`. Add a column and every cached plan for that table is stale: the
 * next execution of one fails with
 *
 *     SQLSTATE[0A000] cached plan must not change result type
 *
 * On a direct connection this is invisible, because the session ends with the
 * request. Behind Neon's pooler the backends are long-lived and keep serving
 * the stale plan, so the errors outlive the migration by a long way.
 *
 * That is exactly what adding image_url to product_variants did: the storefront
 * and two product pages returned 500 deterministically for the best part of an
 * hour, while the same queries ran fine from a fresh connection. Terminating
 * the idle backends fixed it immediately.
 *
 * Safe to run at any time: only backends sitting idle are touched, the pooler
 * reconnects on demand, and anything mid-query is left alone.
 */
class ClearStalePlanCache extends Command
{
    protected $signature = 'db:clear-plan-cache';

    protected $description = 'Drop idle Postgres backends so stale cached query plans go with them';

    public function handle(): int
    {
        if (DB::getDriverName() !== 'pgsql') {
            $this->info('Not Postgres — nothing to do.');

            return self::SUCCESS;
        }

        $terminated = DB::select(
            'select pg_terminate_backend(pid) from pg_stat_activity
             where datname = current_database()
               and pid <> pg_backend_pid()
               and state = ?',
            ['idle'],
        );

        $this->info('Terminated '.count($terminated).' idle backend(s); their cached plans went with them.');

        return self::SUCCESS;
    }
}
