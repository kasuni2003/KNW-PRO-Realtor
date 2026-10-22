<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('seller_property_drafts', function (Blueprint $table) {
            $table->string('listing_plan')->default('basic')->after('documents');
            $table->unsignedInteger('listing_fee')->default(500)->after('listing_plan');
            $table->enum('payment_status', ['pending', 'paid', 'rejected'])->default('pending')->after('listing_fee');
            $table->string('payment_method')->nullable()->after('payment_status');
            $table->string('payment_reference')->nullable()->after('payment_method');
            $table->text('payment_note')->nullable()->after('payment_reference');
            $table->timestamp('paid_at')->nullable()->after('payment_note');
        });
    }

    public function down(): void
    {
        Schema::table('seller_property_drafts', function (Blueprint $table) {
            $table->dropColumn([
                'listing_plan',
                'listing_fee',
                'payment_status',
                'payment_method',
                'payment_reference',
                'payment_note',
                'paid_at',
            ]);
        });
    }
};
