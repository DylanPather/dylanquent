<?php

return [
    /*
     | Currency orders are created in. Was hardcoded to USD in the checkout
     | controller while the whole storefront prices and displays in Rand.
     */
    'currency' => env('STORE_CURRENCY', 'ZAR'),

    'tax' => [
        /*
         | Dylanquent is not VAT registered. SARS registration is compulsory
         | only above R1m turnover in any 12 months, and charging VAT without
         | being registered is an offence — so this stays false until you
         | register, at which point it is the only line that changes.
         */
        'enabled' => env('STORE_TAX_ENABLED', false),

        'rate' => (float) env('STORE_TAX_RATE', 0.15),

        /*
         | South African consumer prices must be displayed inclusive of VAT,
         | so tax is a component of the total rather than added on top.
         | Set false only if your listed prices exclude tax.
         */
        'inclusive' => (bool) env('STORE_TAX_INCLUSIVE', true),

        'label' => env('STORE_TAX_LABEL', 'VAT'),
    ],

    'shipping' => [
        // R80 national flat rate.
        'flat_cents' => (int) env('STORE_SHIPPING_FLAT_CENTS', 8000),

        // Free delivery from R1000. Set 0 to disable the threshold.
        'free_over_cents' => (int) env('STORE_SHIPPING_FREE_OVER_CENTS', 100000),
    ],
];
