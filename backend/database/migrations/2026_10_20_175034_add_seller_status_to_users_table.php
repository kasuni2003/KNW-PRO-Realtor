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
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'seller_status')) {
                $table->enum('seller_status', ['none', 'pending', 'active', 'rejected'])
                    ->default('none')
                    ->after('status');
            }
        });

        // Backfill seller_status for existing sellers
        \Illuminate\Support\Facades\DB::table('users')
            ->where('role', 'seller')
            ->where('status', 'active')
            ->update(['seller_status' => 'active']);

        \Illuminate\Support\Facades\DB::table('users')
            ->where('role', 'seller')
            ->where('status', 'pending')
            ->update(['seller_status' => 'pending']);

        \Illuminate\Support\Facades\DB::table('users')
            ->where('role', 'seller')
            ->where('status', 'rejected')
            ->update(['seller_status' => 'rejected']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'seller_status')) {
                $table->dropColumn('seller_status');
            }
        });
    }
};
