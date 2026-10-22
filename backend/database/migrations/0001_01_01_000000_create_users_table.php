<?php
// database/migrations/2024_01_01_000001_create_users_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('role', ['admin', 'staff', 'lawyer', 'seller', 'buyer'])
                  ->default('buyer');
            $table->enum('status', ['pending', 'under_review', 'active', 'rejected', 'suspended'])
                  ->default('pending');

            // Contact info
            $table->string('phone')->nullable();

            // Seller-specific verification fields
            $table->string('nic_number')->nullable();
            $table->string('nic_document_path')->nullable(); // uploaded file
            $table->string('address')->nullable();

            // Approval tracking
            $table->text('rejection_reason')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();

            // Laravel defaults
            $table->rememberToken();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};