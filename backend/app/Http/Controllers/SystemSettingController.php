<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SystemSettingController extends Controller
{
    /**
     * Public endpoint to fetch all dynamic calculation and pricing settings.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => SystemSetting::getAllSettings(),
        ]);
    }

    /**
     * Admin endpoint to view all settings along with default reference values.
     */
    public function adminIndex(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => SystemSetting::getAllSettings(),
            'defaults' => SystemSetting::getDefaultSettings(),
        ]);
    }

    /**
     * Admin endpoint to save or update calculation values and pricing.
     */
    public function update(Request $request): JsonResponse
    {
        $payload = $request->all();

        // Support either { settings: { ... } } or direct key-value map
        $settings = $payload['settings'] ?? $payload;

        $validGroups = [
            'legal_closing_fees' => 'legal',
            'mortgage_benchmarks' => 'finance',
            'valuation_parameters' => 'valuation',
            'seller_packages' => 'packages',
            'currency_rates' => 'currency',
        ];

        foreach ($settings as $key => $value) {
            if ($key === 'settings') continue;

            $group = $validGroups[$key] ?? 'general';

            SystemSetting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => $value,
                    'group' => $group,
                    'description' => "Updated by Admin on " . now()->toDayDateTimeString(),
                ]
            );
        }

        return response()->json([
            'status' => 'success',
            'message' => 'System calculation values and prices updated successfully.',
            'data' => SystemSetting::getAllSettings(),
        ]);
    }

    /**
     * Admin endpoint to reset calculation settings back to system defaults.
     */
    public function reset(Request $request): JsonResponse
    {
        $key = $request->input('key');

        if ($key) {
            SystemSetting::where('key', $key)->delete();
        } else {
            SystemSetting::truncate();
        }

        return response()->json([
            'status' => 'success',
            'message' => $key
                ? "Settings for '{$key}' reset to defaults."
                : 'All calculation settings reset to system defaults.',
            'data' => SystemSetting::getAllSettings(),
        ]);
    }
}
