<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('property_inquiries', function (Blueprint $table) {
            $table->boolean('is_site_visit')->default(false)->after('message');
            $table->date('visit_date')->nullable()->after('is_site_visit');
            $table->string('visit_slot', 80)->nullable()->after('visit_date');
            $table->string('visit_status', 40)->default('pending')->after('visit_slot');
            $table->date('reschedule_date')->nullable()->after('visit_status');
            $table->string('reschedule_slot', 80)->nullable()->after('reschedule_date');
        });
    }

    public function down(): void
    {
        Schema::table('property_inquiries', function (Blueprint $table) {
            $table->dropColumn([
                'is_site_visit',
                'visit_date',
                'visit_slot',
                'visit_status',
                'reschedule_date',
                'reschedule_slot',
            ]);
        });
    }
};
