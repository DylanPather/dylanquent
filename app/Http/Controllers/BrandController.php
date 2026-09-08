<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;

class BrandController extends Controller
{
    /**
     * The Dylanquent brand gateway — routes visitors into either
     * division: the software studio, or the merch storefront.
     */
    public function index()
    {
        return Inertia::render('brand', [
            'divisions' => [
                [
                    'key' => 'software',
                    'index' => '01',
                    'title' => 'Software',
                    'subtitle' => 'Solo Development Studio',
                    'description' => 'Web platforms, product apps and internal tools — designed, built and shipped end to end by one developer.',
                    'meta' => ['Laravel · React', 'Product & Platform', 'Cape Town / Remote'],
                    'cta' => 'Enter Studio',
                    'href' => route('studio.index'),
                ],
                [
                    'key' => 'merch',
                    'index' => '02',
                    'title' => 'Merch',
                    'subtitle' => 'Minimalist Streetwear',
                    'description' => 'Clean silhouettes, heavy cotton and limited runs. Quiet garments made with the same intent as the software.',
                    'meta' => ['Heavy Cotton', 'Limited Drops', 'Season 01'],
                    'cta' => 'Enter Shop',
                    'href' => route('merch.home'),
                ],
            ],
            'stats' => [
                'products' => Product::where('is_active', true)->count(),
            ],
        ]);
    }
}
