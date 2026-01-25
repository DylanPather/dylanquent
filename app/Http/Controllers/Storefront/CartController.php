<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index()
    {
        $cart = session()->get('cart', []);

        return Inertia::render('cart/index', [
            'cart' => $cart
        ]);
    }

    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($request->product_id);
        $variant = $request->variant_id ? ProductVariant::findOrFail($request->variant_id) : null;

        $cart = session()->get('cart', []);
        $cartKey = $variant ? "v_{$variant->id}" : "p_{$product->id}";

        if (isset($cart[$cartKey])) {
            $cart[$cartKey]['quantity'] += $request->quantity;
        } else {
            $cart[$cartKey] = [
                'id' => $cartKey,
                'product_id' => $product->id,
                'variant_id' => $variant?->id,
                'name' => $product->name . ($variant ? " - {$variant->name}" : ""),
                'price_cents' => $product->price_cents,
                'quantity' => $request->quantity,
                'thumbnail_url' => $product->thumbnail_url,
            ];
        }

        session()->put('cart', $cart);

        return back()->with('success', 'Item added to archive.');
    }

    public function update(Request $request)
    {
        $request->validate([
            'id' => 'required|string',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = session()->get('cart', []);

        if (isset($cart[$request->id])) {
            $cart[$request->id]['quantity'] = $request->quantity;
            session()->put('cart', $cart);
        }

        return back();
    }

    public function remove(Request $request)
    {
        $request->validate([
            'id' => 'required|string',
        ]);

        $cart = session()->get('cart', []);

        if (isset($cart[$request->id])) {
            unset($cart[$request->id]);
            session()->put('cart', $cart);
        }

        return back();
    }
}