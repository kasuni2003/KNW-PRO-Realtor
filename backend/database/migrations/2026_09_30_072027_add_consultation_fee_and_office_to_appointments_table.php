<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->enum('consultation_type', ['video', 'office'])->default('video')->after('topic');
            $table->string('office_location', 255)->nullable()->after('consultation_type');
            $table->decimal('fee_amount', 10, 2)->default(5000.00)->after('office_location');
            $table->decimal('platform_commission', 10, 2)->default(1250.00)->after('fee_amount');
            $table->decimal('lawyer_earnings', 10, 2)->default(3750.00)->after('platform_commission');
            $table->string('payment_method', 50)->nullable()->after('lawyer_earnings');
            $table->enum('payment_status', ['unpaid', 'pending_verification', 'paid', 'refunded'])->default('unpaid')->after('payment_method');
            $table->string('bank_slip_url', 500)->nullable()->after('payment_status');
            $table->string('user_role', 50)->nullable()->after('bank_slip_url');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('appointment_id')->nullable()->constrained('appointments')->nullOnDelete()->after('seller_property_draft_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['appointment_id']);
            $table->dropColumn('appointment_id');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn([
                'consultation_type',
                'office_location',
                'fee_amount',
                'platform_commission',
                'lawyer_earnings',
                'payment_method',
                'payment_status',
                'bank_slip_url',
                'user_role',
            ]);
        });
    }
};
