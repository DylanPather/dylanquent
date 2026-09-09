<?php

namespace App\Http\Controllers\CMS;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class PageController extends Controller
{
    public function index()
    {
        $pages = collect([
            ['id' => 1, 'title' => 'About Us', 'slug' => 'about-us', 'status' => 'published', 'views' => 1245, 'created_at' => 'March 15, 2025', 'author' => 'Dylan'],
            ['id' => 2, 'title' => 'Contact', 'slug' => 'contact', 'status' => 'published', 'views' => 2050, 'created_at' => 'March 10, 2025', 'author' => 'Dylan'],
            ['id' => 3, 'title' => 'FAQ', 'slug' => 'faq', 'status' => 'draft', 'views' => 0, 'created_at' => 'April 01, 2025', 'author' => 'Dylan'],
            ['id' => 4, 'title' => 'Shipping & Returns', 'slug' => 'shipping-returns', 'status' => 'published', 'views' => 856, 'created_at' => 'March 20, 2025', 'author' => 'Dylan'],
        ]);

        return Inertia::render('cms/pages/index', [
            'pages' => $pages,
            'stats' => [
                'total_pages' => 4,
                'published' => 3,
                'drafts' => 1,
                'total_views' => 4151,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('cms/pages/create');
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Page created successfully']);
    }

    public function edit($pageId)
    {
        $page = collect([
            'id' => $pageId,
            'title' => 'About Us',
            'slug' => 'about-us',
            'status' => 'published',
            'content' => '<p>Learn about our company...</p>',
            'meta_title' => 'About Us | Dylanquent',
            'meta_description' => 'Learn more about Dylanquent and our mission',
        ]);

        return Inertia::render('cms/pages/edit', [
            'page' => $page,
        ]);
    }

    public function update(Request $request, $pageId)
    {
        return response()->json(['message' => 'Page updated successfully']);
    }
}
