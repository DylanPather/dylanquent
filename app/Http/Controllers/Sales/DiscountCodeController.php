<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DiscountCodeController extends Controller
{
    public function index(): Response
    {
        $discounts = Discount::query()->latest()->paginate(15)->through(fn (Discount $d) => [
            'id' => $d->id,
            'name' => $d->name,
            'code' => $d->code,
            'type' => $d->type,
            'value' => $d->value,
            'usage_limit' => $d->usage_limit,
            'min_order_value' => $d->min_order_value_cents ? $d->min_order_value_cents / 100 : null,
            'is_active' => $d->is_active,
            'starts_at' => $d->starts_at?->toDateString(),
            'ends_at' => $d->ends_at?->toDateString(),
        ]);

        return Inertia::render('sales/discounts/codes/index', [
            'discounts' => $discounts,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('sales/discounts/codes/create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'code' => ['required','string','max:64','alpha_dash','unique:discounts,code'],
            'type' => ['required', Rule::in(['percent','fixed_amount'])],
            'value' => ['required','integer','min:1'],
            'min_order_value' => ['nullable','numeric','min:0'],
            'usage_limit' => ['nullable','integer','min:1'],
            'starts_at' => ['nullable','date'],
            'ends_at' => ['nullable','date','after_or_equal:starts_at'],
            'is_active' => ['boolean'],
        ]);

        // Additional guards
        if ($data['type'] === 'percent' && ($data['value'] < 1 || $data['value'] > 100)) {
            return back()->withErrors(['value' => 'Percent must be between 1 and 100'])->withInput();
        }

        Discount::create([
            'name' => $data['name'],
            'code' => strtoupper($data['code']),
            'type' => $data['type'],
            'value' => (int) $data['value'],
            'min_order_value_cents' => isset($data['min_order_value']) ? (int) round($data['min_order_value'] * 100) : null,
            'usage_limit' => $data['usage_limit'] ?? null,
            'starts_at' => $data['starts_at'] ?? null,
            'ends_at' => $data['ends_at'] ?? null,
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);

        return redirect()->route('sales.discounts.codes.index')->with('status', 'Discount created');
    }

    public function edit(Discount $discount): Response
    {
        return Inertia::render('sales/discounts/codes/edit', [
            'discount' => [
                'id' => $discount->id,
                'name' => $discount->name,
                'code' => $discount->code,
                'type' => $discount->type,
                'value' => $discount->value,
                'min_order_value' => $discount->min_order_value_cents ? $discount->min_order_value_cents / 100 : null,
                'usage_limit' => $discount->usage_limit,
                'is_active' => $discount->is_active,
                'starts_at' => $discount->starts_at?->toDateString(),
                'ends_at' => $discount->ends_at?->toDateString(),
            ],
        ]);
    }

    public function update(Request $request, Discount $discount)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'code' => ['required','string','max:64','alpha_dash', Rule::unique('discounts', 'code')->ignore($discount->id)],
            'type' => ['required', Rule::in(['percent','fixed_amount'])],
            'value' => ['required','integer','min:1'],
            'min_order_value' => ['nullable','numeric','min:0'],
            'usage_limit' => ['nullable','integer','min:1'],
            'starts_at' => ['nullable','date'],
            'ends_at' => ['nullable','date','after_or_equal:starts_at'],
            'is_active' => ['boolean'],
        ]);

        if ($data['type'] === 'percent' && ($data['value'] < 1 || $data['value'] > 100)) {
            return back()->withErrors(['value' => 'Percent must be between 1 and 100'])->withInput();
        }

        $discount->update([
            'name' => $data['name'],
            'code' => strtoupper($data['code']),
            'type' => $data['type'],
            'value' => (int) $data['value'],
            'min_order_value_cents' => isset($data['min_order_value']) ? (int) round($data['min_order_value'] * 100) : null,
            'usage_limit' => $data['usage_limit'] ?? null,
            'starts_at' => $data['starts_at'] ?? null,
            'ends_at' => $data['ends_at'] ?? null,
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);

        return back()->with('status', 'Discount updated');
    }

    public function destroy(Discount $discount)
    {
        $discount->delete();
        return redirect()->route('sales.discounts.codes.index')->with('status', 'Discount deleted');
    }
}
