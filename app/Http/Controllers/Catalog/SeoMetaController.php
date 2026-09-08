<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SeoMetaController extends Controller
{
    public function index()
    {
        return \Inertia\Inertia::render('catalog/seo-meta');
    }
}
