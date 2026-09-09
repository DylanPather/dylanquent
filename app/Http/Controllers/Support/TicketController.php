<?php

namespace App\Http\Controllers\Support;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function index()
    {
        $tickets = collect([
            ['id' => 1, 'number' => 'TK-001', 'customer' => 'John Doe', 'subject' => 'Order delivery issue', 'status' => 'open', 'priority' => 'high', 'created_at' => 'May 20, 2025'],
            ['id' => 2, 'number' => 'TK-002', 'customer' => 'Jane Smith', 'subject' => 'Product quality concern', 'status' => 'in_progress', 'priority' => 'medium', 'created_at' => 'May 18, 2025'],
            ['id' => 3, 'number' => 'TK-003', 'customer' => 'Bob Johnson', 'subject' => 'Refund request', 'status' => 'resolved', 'priority' => 'high', 'created_at' => 'May 15, 2025'],
            ['id' => 4, 'number' => 'TK-004', 'customer' => 'Alice Brown', 'subject' => 'General inquiry', 'status' => 'closed', 'priority' => 'low', 'created_at' => 'May 10, 2025'],
        ]);

        return Inertia::render('support/tickets/index', [
            'sampleData' => true,
            'tickets' => $tickets,
            'stats' => [
                'total_tickets' => 4,
                'open' => 1,
                'in_progress' => 1,
                'resolved' => 2,
            ],
        ]);
    }

    public function show($ticketId)
    {
        $ticket = collect([
            'id' => $ticketId,
            'number' => 'TK-001',
            'customer' => 'John Doe',
            'email' => 'john@example.com',
            'subject' => 'Order delivery issue',
            'status' => 'open',
            'priority' => 'high',
            'created_at' => 'May 20, 2025',
            'description' => 'My order was supposed to arrive 3 days ago but it hasn\'t arrived yet.',
            'messages' => [
                ['author' => 'John Doe', 'message' => 'My order was supposed to arrive 3 days ago but it hasn\'t arrived yet.', 'created_at' => 'May 20, 2025 10:30 AM'],
                ['author' => 'Support Team', 'message' => 'We apologize for the delay. Let me check the tracking status for you.', 'created_at' => 'May 20, 2025 11:15 AM'],
            ],
        ]);

        return Inertia::render('support/tickets/show', [
            'sampleData' => true,
            'ticket' => $ticket,
        ]);
    }

    public function reply(Request $request, $ticketId)
    {
        return response()->json(['message' => 'Reply added successfully']);
    }

    public function resolve($ticketId)
    {
        return response()->json(['message' => 'Ticket marked as resolved']);
    }
}
