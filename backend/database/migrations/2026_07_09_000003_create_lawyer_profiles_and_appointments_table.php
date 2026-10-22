<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lawyer_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('specialization')->nullable();
            $table->text('bio')->nullable();
            $table->string('office_location')->nullable();
            $table->decimal('consultation_fee', 10, 2)->nullable();
            $table->json('languages')->nullable();
            $table->boolean('is_available')->default(true);
            $table->timestamps();
        });

        Schema::create('lawyer_availability', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lawyer_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('weekday');
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedSmallInteger('slot_minutes')->default(30);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('lawyer_unavailable_dates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lawyer_id')->constrained('users')->cascadeOnDelete();
            $table->date('date');
            $table->string('reason')->nullable();
            $table->timestamps();
            $table->unique(['lawyer_id', 'date']);
        });

        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lawyer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();
            $table->date('appointment_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('topic');
            $table->text('message')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'rejected'])->default('pending');
            $table->text('lawyer_note')->nullable();
            $table->text('admin_note')->nullable();
            $table->timestamps();
            $table->unique(['lawyer_id', 'appointment_date', 'start_time', 'status'], 'appointments_unique_active_slot');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('lawyer_unavailable_dates');
        Schema::dropIfExists('lawyer_availability');
        Schema::dropIfExists('lawyer_profiles');
    }
};
