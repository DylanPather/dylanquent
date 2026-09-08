<?php

namespace App\Http\Controllers\Studio;

use App\Http\Controllers\Controller;
use App\Models\ProjectInquiry;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class InquiryController extends Controller
{
    /**
     * Public: accept a project inquiry from the studio landing page.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:180'],
            'company' => ['nullable', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:40'],
            'project_type' => ['required', 'string', 'max:80'],
            'budget_range' => ['nullable', 'string', 'max:60'],
            'timeline' => ['nullable', 'string', 'max:60'],
            'message' => ['required', 'string', 'min:20', 'max:4000'],
        ]);

        ProjectInquiry::create([
            ...$data,
            'status' => 'new',
            'source' => 'studio',
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Inquiry received. You will get a reply within one business day.');
    }

    /**
     * Admin: inquiry pipeline.
     */
    public function index(Request $request)
    {
        $status = $request->string('status')->toString();
        $search = $request->string('search')->toString();

        $inquiries = ProjectInquiry::query()
            ->when($status && $status !== 'all', fn ($q) => $q->where('status', $status))
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%");
            }))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('studio/inquiries/index', [
            'inquiries' => $inquiries,
            'filters' => ['status' => $status ?: 'all', 'search' => $search],
            'statuses' => ProjectInquiry::STATUSES,
            'stats' => [
                'total' => ProjectInquiry::count(),
                'new' => ProjectInquiry::where('status', 'new')->count(),
                'open' => ProjectInquiry::open()->count(),
                'won' => ProjectInquiry::where('status', 'won')->count(),
            ],
        ]);
    }

    /**
     * Admin: move an inquiry along the pipeline / attach notes.
     */
    public function update(Request $request, ProjectInquiry $inquiry)
    {
        $data = $request->validate([
            'status' => ['sometimes', Rule::in(ProjectInquiry::STATUSES)],
            'internal_notes' => ['sometimes', 'nullable', 'string', 'max:4000'],
        ]);

        if (($data['status'] ?? null) === 'contacted' && ! $inquiry->contacted_at) {
            $data['contacted_at'] = now();
        }

        $inquiry->update($data);

        return back()->with('success', 'Inquiry updated.');
    }

    public function destroy(ProjectInquiry $inquiry)
    {
        $inquiry->delete();

        return back()->with('success', 'Inquiry deleted.');
    }
}
