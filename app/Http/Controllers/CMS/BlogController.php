<?php

namespace App\Http\Controllers\CMS;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class BlogController extends Controller
{
    public function index()
    {
        $posts = collect([
            ['id' => 1, 'title' => '5 Tips for Choosing the Right Hoodie', 'author' => 'Dylan', 'status' => 'published', 'views' => 3245, 'likes' => 156, 'published_at' => 'May 15, 2025'],
            ['id' => 2, 'title' => 'Summer Collection Launch Announcement', 'author' => 'Dylan', 'status' => 'published', 'views' => 2156, 'likes' => 89, 'published_at' => 'May 10, 2025'],
            ['id' => 3, 'title' => 'Behind the Scenes: How We Design', 'author' => 'Dylan', 'status' => 'draft', 'views' => 0, 'likes' => 0, 'published_at' => null],
            ['id' => 4, 'title' => 'Anime TCG Collection Guide', 'author' => 'Dylan', 'status' => 'published', 'views' => 1856, 'likes' => 234, 'published_at' => 'May 01, 2025'],
        ])->all();

        return Inertia::render('cms/blog/index', [
            'posts' => $posts,
            'stats' => [
                'total_posts' => 4,
                'published' => 3,
                'drafts' => 1,
                'total_views' => 7257,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('cms/blog/create');
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Blog post created successfully']);
    }

    public function edit($postId)
    {
        $post = collect([
            'id' => $postId,
            'title' => '5 Tips for Choosing the Right Hoodie',
            'author' => 'Dylan',
            'status' => 'published',
            'content' => '<p>Hoodies are essential...</p>',
            'excerpt' => 'Learn how to choose the perfect hoodie for your style',
            'featured_image' => '/images/blog/hoodie.jpg',
            'tags' => ['fashion', 'hoodies', 'style'],
            'published_at' => '2025-05-15',
        ])->all();

        return Inertia::render('cms/blog/edit', [
            'post' => $post,
        ]);
    }

    public function update(Request $request, $postId)
    {
        return response()->json(['message' => 'Blog post updated successfully']);
    }
}
