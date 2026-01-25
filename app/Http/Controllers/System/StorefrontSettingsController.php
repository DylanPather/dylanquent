<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class StorefrontSettingsController extends Controller
{
    public function index()
    {
        $settings = \App\Models\StorefrontSetting::all()->mapWithKeys(function ($item) {
            $value = $item->value;
            if ($item->type === 'json') {
                $value = json_decode($value, true);
            }
            return [$item->key => $value];
        });

        $products = \App\Models\Product::select('id', 'name', 'sku', 'thumbnail_url')->get();

        return \Inertia\Inertia::render('system/storefront-settings', [
            'settings' => $settings,
            'availableProducts' => $products,
        ]);
    }

    public function update(\Illuminate\Http\Request $request)
    {
        $data = $request->all();

        // Handle Potential Hero Image/Other uploads if needed
        // For now, focusing on the settings logic

        foreach ($data as $key => $value) {
            $setting = \App\Models\StorefrontSetting::where('key', $key)->first();
            if ($setting) {
                // If it's the featured_products, we might have new images or IDs
                $setting->update([
                    'value' => $setting->type === 'json' ? json_encode($value) : $value,
                ]);
            }
        }

        return back()->with('status', 'Storefront settings updated');
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:2048',
        ]);

        $disk = config('filesystems.default');
        $path = $request->file('image')->store('storefront', $disk);

        return response()->json([
            'url' => \Illuminate\Support\Facades\Storage::disk($disk)->url($path),
        ]);
    }
}
