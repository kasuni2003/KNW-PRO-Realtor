<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('video_meeting_url', 500)->nullable()->after('admin_note');
        });

        Schema::table('seller_property_drafts', function (Blueprint $table) {
            $table->boolean('is_deed_verified')->default(false)->after('status');
            $table->timestamp('deed_verified_at')->nullable()->after('is_deed_verified');
            $table->foreignId('deed_verified_by')->nullable()->constrained('users')->nullOnDelete()->after('deed_verified_at');
            $table->text('deed_verification_note')->nullable()->after('deed_verified_by');
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn('video_meeting_url');
        });

        Schema::table('seller_property_drafts', function (Blueprint $table) {
            $table->dropForeign(['deed_verified_by']);
            $table->dropColumn([
                'is_deed_verified',
                'deed_verified_at',
                'deed_verified_by',
                'deed_verification_note',
            ]);
        });
    }
};
