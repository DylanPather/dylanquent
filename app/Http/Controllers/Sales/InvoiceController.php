<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(): Response
    {
        $invoices = Invoice::query()->latest()->paginate(15)->through(fn (Invoice $i) => [
            'id' => $i->id,
            'invoice_number' => $i->invoice_number,
            'status' => $i->status,
            'total_cents' => $i->total_cents,
            'currency' => $i->currency,
            'issued_at' => $i->issued_at?->toDateString(),
            'due_at' => $i->due_at?->toDateString(),
        ]);

        return Inertia::render('sales/invoices/index', [
            'invoices' => $invoices,
        ]);
    }
}

