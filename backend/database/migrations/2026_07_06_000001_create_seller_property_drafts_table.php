<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seller_property_drafts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('seller_name')->nullable();
            $table->string('seller_email')->nullable();
            $table->string('property_type');
            $table->string('district');
            $table->string('expected_price');
            $table->string('contact_number');
            $table->text('description')->nullable();
            $table->date('preferred_visit_date')->nullable();
            $table->string('visit_time')->nullable();
            $table->json('documents')->nullable();
            $table->boolean('terms_accepted')->default(false);
            $table->boolean('visit_permission')->default(false);
            $table->boolean('review_acknowledged')->default(false);
            $table->enum('status', ['pending_review', 'published', 'rejected'])->default('pending_review');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seller_property_drafts');
    }
};
