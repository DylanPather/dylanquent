<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseController extends Controller
{
    public function index(): Response
    {
        $warehouses = Warehouse::query()->orderBy('name')->get(['id','name','code','is_active','created_at']);
        return Inertia::render('inventory/warehouses', [
            'warehouses' => $warehouses,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('inventory/warehouses/create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'code' => ['required','string','max:50','unique:warehouses,code'],
            'is_active' => ['boolean'],
        ]);
        Warehouse::create([
            'name' => $data['name'],
            'code' => strtoupper($data['code']),
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);
        return redirect()->route('inventory.warehouses.index')->with('status', 'Warehouse created');
    }

    public function edit(Warehouse $warehouse): Response
    {
        return Inertia::render('inventory/warehouses/edit', [
            'warehouse' => [
                'id' => $warehouse->id,
                'name' => $warehouse->name,
                'code' => $warehouse->code,
                'is_active' => $warehouse->is_active,
            ],
        ]);
    }

    public function update(Request $request, Warehouse $warehouse)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'code' => ['required','string','max:50','unique:warehouses,code,'.$warehouse->id],
            'is_active' => ['boolean'],
        ]);
        $warehouse->update([
            'name' => $data['name'],
            'code' => strtoupper($data['code']),
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);
        return back()->with('status', 'Warehouse updated');
    }

    public function destroy(Warehouse $warehouse)
    {
        $warehouse->delete();
        return redirect()->route('inventory.warehouses.index')->with('status', 'Warehouse deleted');
    }
}
