<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('seller_property_drafts', function (Blueprint $table) {
            $table->json('visit_dates')->nullable()->after('preferred_visit_date');
            $table->json('visit_days')->nullable()->after('visit_dates');
            $table->string('location_url')->nullable()->after('visit_time');
            $table->decimal('latitude', 10, 7)->nullable()->after('location_url');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->json('property_images')->nullable()->after('documents');
            $table->string('payment_slip_path')->nullable()->after('payment_reference');
            $table->string('online_payment_provider')->nullable()->after('payment_note');
            $table->string('online_payment_reference')->nullable()->after('online_payment_provider');
        });
    }

    public function down(): void
    {
        Schema::table('seller_property_drafts', function (Blueprint $table) {
            $table->dropColumn([
                'visit_dates',
                'visit_days',
                'location_url',
                'latitude',
                'longitude',
                'property_images',
                'payment_slip_path',
                'online_payment_provider',
                'online_payment_reference',
            ]);
        });
    }
};
