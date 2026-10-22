<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $table = 'system_settings';

    protected $fillable = [
        'key',
        'value',
        'group',
        'description',
    ];

    protected $casts = [
        'value' => 'array',
    ];

    /**
     * Default calculations, rates, and parameters for the KNW PRO Realtor system.
     */
    public static function getDefaultSettings(): array
    {
        return [
            'legal_closing_fees' => [
                'stamp_duty_threshold' => 100000,
                'stamp_duty_tier1_rate' => 3.0,
                'stamp_duty_tier2_rate' => 4.0,
                'lawyer_notary_rate' => 1.5,
                'land_registry_rate' => 0.2,
                'land_registry_cap' => 50000,
                'title_search_fee' => 25000,
            ],
            'mortgage_benchmarks' => [
                'benchmark_interest_rate' => 12.5,
                'default_down_payment_pct' => 20,
                'default_tenure_years' => 15,
                'bank_rates' => [
                    ['bank' => 'Commercial Bank', 'rate' => '11.75% - 12.50%', 'tag' => 'Competitive'],
                    ['bank' => 'Hatton National Bank (HNB)', 'rate' => '12.00% - 13.00%', 'tag' => 'Fast Approval'],
                    ['bank' => 'Sampath Bank', 'rate' => '12.25% - 13.25%', 'tag' => 'Flexible Terms'],
                    ['bank' => 'Bank of Ceylon (BOC)', 'rate' => '11.50% - 12.25%', 'tag' => 'Government Bank'],
                ],
            ],
            'valuation_parameters' => [
                'districts' => [
                    'Colombo' => [
                        'basePerch' => 3800000,
                        'growthRate' => '8.5% YoY',
                        'zones' => [
                            ['name' => 'Colombo 03 / 07 / 04 (Ultra-Prime)', 'multiplier' => 3.2, 'avgPerch' => 'Rs. 10M - 15M/perch'],
                            ['name' => 'Rajagiriya / Battaramulla / Nawala', 'multiplier' => 1.6, 'avgPerch' => 'Rs. 5M - 7.5M/perch'],
                            ['name' => 'Nugegoda / Maharagama / Dehiwala', 'multiplier' => 1.15, 'avgPerch' => 'Rs. 3.5M - 5M/perch'],
                            ['name' => 'Kottawa / Malabe / Homagama', 'multiplier' => 0.65, 'avgPerch' => 'Rs. 1.8M - 2.8M/perch'],
                        ],
                    ],
                    'Gampaha' => [
                        'basePerch' => 1400000,
                        'growthRate' => '9.2% YoY',
                        'zones' => [
                            ['name' => 'Negombo Beach Road / Tourist Area', 'multiplier' => 2.2, 'avgPerch' => 'Rs. 2.5M - 4.5M/perch'],
                            ['name' => 'Wattala / Kelaniya (Close to Colombo)', 'multiplier' => 1.8, 'avgPerch' => 'Rs. 2.2M - 3.2M/perch'],
                            ['name' => 'Gampaha Town / Kadawatha', 'multiplier' => 1.1, 'avgPerch' => 'Rs. 1.4M - 2.0M/perch'],
                            ['name' => 'Mirigama / Minuwangoda', 'multiplier' => 0.55, 'avgPerch' => 'Rs. 600K - 950K/perch'],
                        ],
                    ],
                    'Kandy' => [
                        'basePerch' => 1900000,
                        'growthRate' => '7.8% YoY',
                        'zones' => [
                            ['name' => 'Kandy Lake Round / City Centre', 'multiplier' => 2.5, 'avgPerch' => 'Rs. 4M - 6M/perch'],
                            ['name' => 'Peradeniya / Anniewatte / Katugastota', 'multiplier' => 1.3, 'avgPerch' => 'Rs. 2M - 3M/perch'],
                            ['name' => 'Kundasale / Digana (Golf Area)', 'multiplier' => 0.95, 'avgPerch' => 'Rs. 1.2M - 1.8M/perch'],
                            ['name' => 'Pilimathalawa / Gampola', 'multiplier' => 0.6, 'avgPerch' => 'Rs. 700K - 1.1M/perch'],
                        ],
                    ],
                    'Galle' => [
                        'basePerch' => 2100000,
                        'growthRate' => '11.4% YoY',
                        'zones' => [
                            ['name' => 'Galle Fort & Direct Beachfront', 'multiplier' => 4.0, 'avgPerch' => 'Rs. 7M - 12M/perch'],
                            ['name' => 'Unawatuna / Thalpe / Ahangama (Coastal)', 'multiplier' => 2.8, 'avgPerch' => 'Rs. 5M - 8M/perch'],
                            ['name' => 'Galle Town / Karapitiya', 'multiplier' => 1.2, 'avgPerch' => 'Rs. 2M - 3.2M/perch'],
                            ['name' => 'Hikkaduwa Inland / Baddegama', 'multiplier' => 0.6, 'avgPerch' => 'Rs. 800K - 1.4M/perch'],
                        ],
                    ],
                    'Nuwara Eliya' => [
                        'basePerch' => 1800000,
                        'growthRate' => '8.0% YoY',
                        'zones' => [
                            ['name' => 'Gregory Lake / City View', 'multiplier' => 2.4, 'avgPerch' => 'Rs. 3.5M - 5.5M/perch'],
                            ['name' => 'Blackpool / Hawa Eliya', 'multiplier' => 1.1, 'avgPerch' => 'Rs. 1.6M - 2.5M/perch'],
                            ['name' => 'Hatton / Talawakele', 'multiplier' => 0.5, 'avgPerch' => 'Rs. 600K - 1M/perch'],
                        ],
                    ],
                    'Kalutara' => [
                        'basePerch' => 1100000,
                        'growthRate' => '7.5% YoY',
                        'zones' => [
                            ['name' => 'Panadura Beach / Galle Road', 'multiplier' => 1.9, 'avgPerch' => 'Rs. 1.8M - 2.8M/perch'],
                            ['name' => 'Kalutara North & South', 'multiplier' => 1.0, 'avgPerch' => 'Rs. 1M - 1.6M/perch'],
                            ['name' => 'Horana / Bandaragama', 'multiplier' => 0.75, 'avgPerch' => 'Rs. 750K - 1.2M/perch'],
                        ],
                    ],
                ],
                'road_factors' => [
                    '20ft' => 1.08,
                    '15ft' => 1.00,
                    '10ft' => 0.88,
                ],
                'construction_sqft_costs' => [
                    'modern' => 8500,
                    'standard' => 5500,
                ],
                'estimation_margins' => [
                    'min' => 0.92,
                    'max' => 1.08,
                ],
            ],
            'seller_packages' => [
                'listing_plans' => [
                    ['id' => 'basic', 'name' => 'Basic Listing', 'price' => 500, 'text' => 'Submit 1 land or property listing for admin review.'],
                    ['id' => 'verified', 'name' => 'Verified Listing', 'price' => 1000, 'text' => 'Listing review plus basic document readiness check.'],
                    ['id' => 'featured', 'name' => 'Featured Listing', 'price' => 2500, 'text' => 'Priority listing review plus advisor follow-up.'],
                ],
                'lawyer_consultation_default_fee' => 5000,
                'platform_commission_pct' => 25,
            ],
            'currency_rates' => [
                'LKR' => ['code' => 'LKR', 'symbol' => 'Rs.', 'label' => 'Sri Lankan Rupee', 'rate' => 1.0, 'flag' => '🇱🇰'],
                'USD' => ['code' => 'USD', 'symbol' => '$', 'label' => 'US Dollar', 'rate' => 0.003278688, 'flag' => '🇺🇸'],
                'GBP' => ['code' => 'GBP', 'symbol' => '£', 'label' => 'British Pound', 'rate' => 0.002531645, 'flag' => '🇬🇧'],
                'AUD' => ['code' => 'AUD', 'symbol' => 'A$', 'label' => 'Australian Dollar', 'rate' => 0.004950495, 'flag' => '🇦🇺'],
                'EUR' => ['code' => 'EUR', 'symbol' => '€', 'label' => 'Euro', 'rate' => 0.003012048, 'flag' => '🇪🇺'],
                'AED' => ['code' => 'AED', 'symbol' => 'AED', 'label' => 'UAE Dirham', 'rate' => 0.012048192, 'flag' => '🇦🇪'],
                'CAD' => ['code' => 'CAD', 'symbol' => 'C$', 'label' => 'Canadian Dollar', 'rate' => 0.004444444, 'flag' => '🇨🇦'],
            ],
        ];
    }

    /**
     * Retrieve all settings merged with default fallback values.
     */
    public static function getAllSettings(): array
    {
        $defaults = self::getDefaultSettings();
        $stored = self::all()->keyBy('key');

        $result = [];
        foreach ($defaults as $key => $defaultVal) {
            if ($stored->has($key)) {
                $val = $stored->get($key)->value;
                $result[$key] = is_array($val) ? array_replace_recursive($defaultVal, $val) : $val;
            } else {
                $result[$key] = $defaultVal;
            }
        }

        foreach ($stored as $key => $item) {
            if (!isset($result[$key])) {
                $result[$key] = $item->value;
            }
        }

        return $result;
    }
}
