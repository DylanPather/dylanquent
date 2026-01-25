<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BulkEditorController extends Controller
{
    public function index()
    {
        $products = \App\Models\Product::with('variants')->get();
        return \Inertia\Inertia::render('catalog/bulk-editor', [
            'products' => $products
        ]);
    }
}
