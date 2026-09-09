<?php

return [
    /*
     | Currency orders are created in. Was hardcoded to USD in the checkout
     | controller while the whole storefront prices and displays in Rand.
     */
    'currency' => env('STORE_CURRENCY', 'ZAR'),
];
