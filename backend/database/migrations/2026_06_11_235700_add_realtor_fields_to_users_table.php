<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['admin', 'staff', 'lawyer', 'seller', 'buyer'])
                    ->default('buyer')
                    ->after('password');
            }

            if (! Schema::hasColumn('users', 'status')) {
                $table->enum('status', ['pending', 'under_review', 'active', 'rejected', 'suspended'])
                    ->default('pending')
                    ->after('role');
            }

            if (! Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('status');
            }

            if (! Schema::hasColumn('users', 'nic_number')) {
                $table->string('nic_number')->nullable()->after('phone');
            }

            if (! Schema::hasColumn('users', 'nic_document_path')) {
                $table->string('nic_document_path')->nullable()->after('nic_number');
            }

            if (! Schema::hasColumn('users', 'address')) {
                $table->string('address')->nullable()->after('nic_document_path');
            }

            if (! Schema::hasColumn('users', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('address');
            }

            if (! Schema::hasColumn('users', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('rejection_reason');
            }

            if (! Schema::hasColumn('users', 'approved_by')) {
                $table->foreignId('approved_by')->nullable()->after('approved_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            foreach ([
                'approved_by',
                'approved_at',
                'rejection_reason',
                'address',
                'nic_document_path',
                'nic_number',
                'phone',
                'status',
                'role',
            ] as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
