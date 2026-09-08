<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductImageController extends Controller
{
    public function store(Request $request, Product $product)
    {
        $validated = $request->validate([
            'image' => 'required|image|max:5120',
            'is_primary' => 'boolean',
        ]);

        if ($request->file('image')) {
            $path = $request->file('image')->store('products', config('filesystems.default'));

            $image = ProductImage::create([
                'product_id' => $product->id,
                'url' => $path,
                'sort_order' => $product->images()->max('sort_order') + 1 ?? 0,
                'is_primary' => $validated['is_primary'] ?? false,
            ]);

            if ($image->is_primary) {
                $product->images()->where('id', '!=', $image->id)->update(['is_primary' => false]);
            }

            return back()->with('success', 'Image uploaded successfully');
        }

        return back()->with('error', 'Failed to upload image');
    }

    public function update(Request $request, ProductImage $image)
    {
        $validated = $request->validate([
            'sort_order' => 'integer',
            'is_primary' => 'boolean',
        ]);

        $image->update($validated);

        if ($image->is_primary) {
            $image->product->images()->where('id', '!=', $image->id)->update(['is_primary' => false]);
        }

        return back()->with('success', 'Image updated successfully');
    }

    public function destroy(ProductImage $image)
    {
        $product = $image->product;

        // Seeded assets live under public/ and are not ours to delete.
        if ($path = $image->storagePath()) {
            if (! str_starts_with($path, '/') && ! str_starts_with($path, 'http')) {
                Storage::disk(config('filesystems.default'))->delete($path);
            }
        }

        $image->delete();

        if ($image->is_primary && $product->images()->exists()) {
            $product->images()->first()->update(['is_primary' => true]);
        }

        return back()->with('success', 'Image deleted successfully');
    }

    public function reorder(Request $request, Product $product)
    {
        $validated = $request->validate([
            'images' => 'required|array',
            'images.*.id' => 'required|integer|exists:product_images,id',
            'images.*.sort_order' => 'required|integer',
        ]);

        foreach ($validated['images'] as $imageData) {
            ProductImage::find($imageData['id'])->update(['sort_order' => $imageData['sort_order']]);
        }

        return back()->with('success', 'Images reordered successfully');
    }
}
