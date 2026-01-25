<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $reviews = Review::with(['product', 'user'])
            ->latest()
            ->get();

        return Inertia::render('catalog/reviews', [
            'reviews' => $reviews
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Review $review)
    {
        $data = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
            'is_visible' => 'boolean',
        ]);

        $review->update($data);

        return back()->with('status', 'Review updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Review $review)
    {
        $review->delete();

        return back()->with('status', 'Review deleted successfully');
    }
}
