<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MediaLibraryController extends Controller
{
    public function index()
    {
        // For now, listing storefront images as mock data
        $files = \Illuminate\Support\Facades\Storage::disk(config('filesystems.default'))->files('storefront');
        $media = array_map(function ($file) {
            return [
                'name' => basename($file),
                'url' => \Illuminate\Support\Facades\Storage::url($file),
                'size' => \Illuminate\Support\Facades\Storage::size($file),
                'type' => \Illuminate\Support\Facades\Storage::mimeType($file),
            ];
        }, $files);

        return \Inertia\Inertia::render('catalog/media-library', [
            'media' => $media
        ]);
    }
}
