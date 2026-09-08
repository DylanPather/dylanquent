<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Models\ProductAttribute;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductAttributeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $attributes = ProductAttribute::latest()->get();

        return Inertia::render('catalog/attributes', [
            'attributes' => $attributes
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:text,select,color',
            'values' => 'nullable|array',
        ]);

        ProductAttribute::create($data);

        return back()->with('status', 'Attribute created successfully');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductAttribute $attribute)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:text,select,color',
            'values' => 'nullable|array',
        ]);

        $attribute->update($data);

        return back()->with('status', 'Attribute updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductAttribute $attribute)
    {
        $attribute->delete();

        return back()->with('status', 'Attribute deleted successfully');
    }
}
