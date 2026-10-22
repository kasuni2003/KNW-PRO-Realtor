<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('seller_property_draft_id')->nullable()->constrained('seller_property_drafts')->nullOnDelete();
            $table->string('provider')->default('payhere');
            $table->string('order_id')->unique();
            $table->string('plan')->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 8)->default('LKR');
            $table->enum('status', ['pending', 'demo_paid', 'paid', 'failed', 'cancelled'])->default('pending');
            $table->string('payer_name')->nullable();
            $table->string('payer_email')->nullable();
            $table->string('payer_phone')->nullable();
            $table->string('payment_reference')->nullable();
            $table->json('gateway_payload')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('seller_property_draft_id')->nullable()->constrained('seller_property_drafts')->nullOnDelete();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('role_label')->nullable();
            $table->string('country')->nullable();
            $table->unsignedTinyInteger('rating');
            $table->string('title')->nullable();
            $table->text('comment');
            $table->enum('type', ['buyer', 'seller', 'foreign_buyer', 'lawyer_client'])->default('buyer');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->boolean('verified')->default(false);
            $table->unsignedInteger('helpful_count')->default(0);
            $table->text('admin_note')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('saved_properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('seller_property_draft_id')->constrained('seller_property_drafts')->cascadeOnDelete();
            $table->text('note')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'seller_property_draft_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_properties');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('payments');
    }
};
