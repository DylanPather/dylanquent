<?php

namespace App\Console\Commands;

use App\Services\Shipping\BobGoRateProvider;
use App\Services\Shipping\ConfiguredRateProvider;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class ProbeShippingRates extends Command
{
    protected $signature = 'shipping:probe {--postcode=2000 : Destination postal code}';

    protected $description = 'Call the Bob Go rates endpoint and show the raw response, to verify the field mapping';

    public function handle(): int
    {
        $config = config('store.shipping.bobgo');

        if (empty($config['token'])) {
            $this->error('No BOBGO_TOKEN set.');
            $this->line('Create a sandbox account at https://sandbox.bobgo.co.za, then copy the Test API key');
            $this->line('from Settings into BOBGO_TOKEN, and set BOBGO_ENABLED=true BOBGO_SANDBOX=true.');

            return self::FAILURE;
        }

        $provider = new BobGoRateProvider(app(ConfiguredRateProvider::class));

        $this->info('Endpoint: '.$provider->baseUrl().'/rates');
        $this->info('Mode: '.($config['sandbox'] ? 'sandbox' : 'PRODUCTION'));
        $this->newLine();

        $response = Http::withToken($config['token'])
            ->acceptJson()
            ->timeout(15)
            ->post($provider->baseUrl().'/rates', [
                'collection_address' => $config['origin'],
                'delivery_address' => ['code' => $this->option('postcode'), 'country' => 'ZA'],
                'parcels' => [[
                    'submitted_length_cm' => $config['default_parcel']['length_cm'],
                    'submitted_width_cm' => $config['default_parcel']['width_cm'],
                    'submitted_height_cm' => $config['default_parcel']['height_cm'],
                    'submitted_weight_kg' => $config['default_parcel']['weight_kg'],
                ]],
            ]);

        $this->line('HTTP '.$response->status());
        $this->newLine();
        $this->line(json_encode($response->json(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        $this->newLine();

        if (! $response->successful()) {
            $this->warn('Request failed. Compare the error against the payload field names in BobGoRateProvider::payload().');

            return self::FAILURE;
        }

        $this->info('Now check that BobGoRateProvider::toRates() reads the right keys from the JSON above.');

        return self::SUCCESS;
    }
}
