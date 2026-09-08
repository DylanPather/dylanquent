<?php

use App\Models\ProjectInquiry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('shows the brand gateway with both divisions', function () {
    $this->get('/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('brand')
            ->has('divisions', 2)
            ->where('divisions.0.key', 'software')
            ->where('divisions.1.key', 'merch'));
});

it('shows the merch storefront home', function () {
    $this->get('/merch')->assertOk()
        ->assertInertia(fn ($page) => $page->component('welcome'));
});

it('shows the studio landing page', function () {
    $this->get('/studio')->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('studio/index')
            ->has('services')
            ->has('work')
            ->has('engagements', 3)
            ->has('addOns')
            ->has('terms', 4)
            ->where('engagements.0.price', 'R3 500')
            ->where('engagements.1.price', 'R9 500')
            ->where('engagements.2.price', 'R750'));
});

it('accepts a project inquiry', function () {
    $this->post('/studio/inquiries', [
        'name' => 'Jordan Smith',
        'email' => 'jordan@example.com',
        'company' => 'Example Co',
        'project_type' => 'Web application',
        'budget_range' => 'R75k – R150k',
        'timeline' => 'ASAP',
        'message' => 'We need a booking platform for our studio spaces, starting from scratch.',
    ])->assertRedirect();

    expect(ProjectInquiry::where('email', 'jordan@example.com')->first())
        ->not->toBeNull()
        ->status->toBe('new')
        ->source->toBe('studio');
});

it('rejects an inquiry with a too-short message', function () {
    $this->post('/studio/inquiries', [
        'name' => 'Jordan Smith',
        'email' => 'jordan@example.com',
        'project_type' => 'Web application',
        'message' => 'hi',
    ])->assertSessionHasErrors('message');

    expect(ProjectInquiry::count())->toBe(0);
});

it('keeps the inquiry pipeline behind auth', function () {
    $this->get('/studio/inquiries')->assertRedirect('/login');
});

it('lists inquiries for an authenticated user', function () {
    $inquiry = ProjectInquiry::create([
        'name' => 'Jordan Smith',
        'email' => 'jordan@example.com',
        'project_type' => 'Web application',
        'message' => 'We need a booking platform for our studio spaces.',
        'status' => 'new',
    ]);

    $this->actingAs(User::factory()->create())
        ->get('/studio/inquiries')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('studio/inquiries/index')
            ->has('inquiries.data', 1)
            ->where('stats.new', 1));

    $this->actingAs(User::factory()->create())
        ->put("/studio/inquiries/{$inquiry->id}", ['status' => 'contacted'])
        ->assertRedirect();

    expect($inquiry->fresh())->status->toBe('contacted')
        ->and($inquiry->fresh()->contacted_at)->not->toBeNull();
});
