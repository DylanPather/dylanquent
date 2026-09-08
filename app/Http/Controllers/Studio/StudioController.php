<?php

namespace App\Http\Controllers\Studio;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class StudioController extends Controller
{
    /**
     * Dylanquent Software — the solo development studio landing page.
     *
     * Content lives here (rather than in the React page) so it can be moved
     * behind the CMS / storefront settings later without touching the view.
     */
    public function index()
    {
        return Inertia::render('studio/index', [
            'services' => $this->services(),
            'work' => $this->work(),
            'process' => $this->process(),
            'engagements' => $this->engagements(),
            'addOns' => $this->addOns(),
            'terms' => $this->terms(),
            'stack' => [
                'Laravel', 'PHP', 'React', 'TypeScript', 'Inertia',
                'Tailwind', 'MySQL / Postgres', 'Redis', 'Stripe', 'AWS',
            ],
            'projectTypes' => [
                'Web application',
                'E-commerce build',
                'Internal tool / dashboard',
                'API & integrations',
                'Existing codebase rescue',
                'Something else',
            ],
            'budgetRanges' => [
                'Under R5k',
                'R5k – R10k',
                'R10k – R20k',
                'R20k+',
                'Care plan only',
                'Not sure yet',
            ],
            'timelines' => [
                'ASAP',
                'Within a month',
                '1 – 3 months',
                'Just exploring',
            ],
        ]);
    }

    private function services(): array
    {
        return [
            [
                'index' => '01',
                'title' => 'Product Builds',
                'text' => 'Zero to launched. Data model, backend, interface and deploy — a complete working product rather than a prototype that needs a team to finish.',
                'points' => ['Laravel + React / Inertia', 'Auth, billing, roles', 'Deployed and monitored'],
            ],
            [
                'index' => '02',
                'title' => 'E-Commerce',
                'text' => 'Storefronts and the operational layer behind them: catalog, inventory, orders, fulfilment, payments and the admin your team actually works in.',
                'points' => ['Custom storefronts', 'Stripe & local gateways', 'Ops & fulfilment tooling'],
            ],
            [
                'index' => '03',
                'title' => 'Internal Tools',
                'text' => 'The dashboards, back-offices and automations that replace the spreadsheet everyone is quietly afraid of.',
                'points' => ['Admin panels', 'Reporting & analytics', 'Workflow automation'],
            ],
            [
                'index' => '04',
                'title' => 'Codebase Rescue',
                'text' => 'Inherited a project that stalled? Audit, stabilise, pay down the worst of the debt, then ship the roadmap that was stuck.',
                'points' => ['Technical audit', 'Refactor & test coverage', 'Handover documentation'],
            ],
        ];
    }

    private function work(): array
    {
        return [
            [
                'name' => 'Dylanquent Commerce',
                'category' => 'Platform · In production',
                'year' => '2026',
                'text' => 'The commerce platform running this brand: storefront, checkout, payments, inventory, fulfilment and a full operations dashboard.',
                'tags' => ['Laravel 12', 'React 19', 'Inertia', 'Stripe'],
                'href' => '/merch',
                'placeholder' => false,
            ],
            [
                'name' => 'Project Slot 02',
                'category' => 'Replace with a real case study',
                'year' => '—',
                'text' => 'Placeholder card. Swap this for a client build: the problem, what you shipped, and the outcome in one or two lines.',
                'tags' => ['Add', 'Your', 'Stack'],
                'href' => null,
                'placeholder' => true,
            ],
            [
                'name' => 'Project Slot 03',
                'category' => 'Replace with a real case study',
                'year' => '—',
                'text' => 'Placeholder card. Swap this for a client build: the problem, what you shipped, and the outcome in one or two lines.',
                'tags' => ['Add', 'Your', 'Stack'],
                'href' => null,
                'placeholder' => true,
            ],
        ];
    }

    private function process(): array
    {
        return [
            ['step' => '01', 'title' => 'Scope', 'text' => 'A call, then a written scope: what gets built, what does not, and what it costs. No moving targets.'],
            ['step' => '02', 'title' => 'Design', 'text' => 'Data model and interface decided before code. Cheap to change on paper, expensive to change in production.'],
            ['step' => '03', 'title' => 'Build', 'text' => 'Shipped in weekly increments to a staging URL you can click through. You see progress, not status reports.'],
            ['step' => '04', 'title' => 'Launch', 'text' => 'Deployed, monitored and documented. Handover so you are never locked to one developer.'],
        ];
    }

    /**
     * Published price list — fixed prices, ZAR, excluding VAT.
     *
     * Timelines are derived from the day rate so the ladder stays internally
     * consistent: a R9 500 build at R1 200/day is roughly eight working days.
     */
    private function engagements(): array
    {
        return [
            [
                'name' => 'Launch Site',
                'price' => 'R3 500',
                'unit' => 'once-off',
                'duration' => 'Live in about a week',
                'summary' => 'A real presence online, fast. For businesses that need to be findable and contactable.',
                'includes' => [
                    'Up to 5 pages',
                    'Works on phones and desktop',
                    'Contact form to your inbox',
                    'Basic SEO and Google setup',
                    'Deployed live, domain connected',
                ],
                'featured' => false,
            ],
            [
                'name' => 'Build',
                'price' => 'R9 500',
                'unit' => 'once-off',
                'duration' => 'About two weeks',
                'summary' => 'A working product: an online store or a web app that people log into and use.',
                'includes' => [
                    'Everything in Launch Site',
                    'Customer accounts and logins',
                    'Admin dashboard you control',
                    'Online payments wired up',
                    'Weekly demo link as it is built',
                    '14 days of fixes after launch',
                ],
                'featured' => true,
            ],
            [
                'name' => 'Care Plan',
                'price' => 'R750',
                'unit' => 'per month',
                'duration' => 'Cancel any time',
                'summary' => 'Keeps the thing you paid for running, and small changes off your plate.',
                'includes' => [
                    'Hosting and uptime watched',
                    'Security and package updates',
                    'Backups checked monthly',
                    '2 hours of small changes',
                    'Priority on anything broken',
                ],
                'featured' => false,
            ],
        ];
    }

    /**
     * À la carte line items. Published so a quote can be checked line by line.
     */
    private function addOns(): array
    {
        return [
            ['item' => 'Extra page', 'price' => 'R450'],
            ['item' => 'Payment gateway (Stripe, PayFast, Yoco)', 'price' => 'R1 200'],
            ['item' => 'Product import, up to 50 items', 'price' => 'R900'],
            ['item' => 'Business email and domain setup', 'price' => 'R650'],
            ['item' => 'Bookings or calendar system', 'price' => 'R1 800'],
            ['item' => 'Customer login area', 'price' => 'R1 500'],
            ['item' => 'Blog or news section', 'price' => 'R900'],
            ['item' => 'Outside integration (CRM, courier, accounting)', 'price' => 'R1 500'],
            ['item' => 'Logo and brand basics', 'price' => 'R1 200'],
            ['item' => 'Copywriting, per page', 'price' => 'R350'],
            ['item' => 'Rush delivery (timeline halved)', 'price' => '+30%'],
            ['item' => 'Work outside the agreed scope', 'price' => 'R1 200 / day'],
        ];
    }

    /**
     * Payment terms, stated publicly — certainty is the argument for a budget studio.
     */
    private function terms(): array
    {
        return [
            ['title' => '50% to start', 'text' => 'Half the quote up front, the balance on the day it goes live. Nothing is due before you have a written scope.'],
            ['title' => 'The quote is the price', 'text' => 'Fixed, not an estimate. Extras only happen if you approve them in writing first.'],
            ['title' => 'No lock-in', 'text' => 'The care plan is month to month. Cancel whenever — the site stays yours and keeps running.'],
            ['title' => 'You own everything', 'text' => 'Code, domain, hosting and accounts are in your name from day one. No hostage situations.'],
        ];
    }
}
