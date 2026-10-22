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
        Schema::table('seller_property_drafts', function (Blueprint $table) {
            $table->string('deed_document_path')->nullable()->after('documents');
            $table->string('survey_plan_path')->nullable()->after('deed_document_path');
            $table->string('council_document_path')->nullable()->after('survey_plan_path');
            $table->string('other_document_path')->nullable()->after('council_document_path');
            $table->string('legal_status', 40)->default('no_documents')->after('status');
            $table->text('legal_review_note')->nullable()->after('legal_status');
            $table->timestamp('legal_reviewed_at')->nullable()->after('legal_review_note');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seller_property_drafts', function (Blueprint $table) {
            $table->dropColumn([
                'deed_document_path',
                'survey_plan_path',
                'council_document_path',
                'other_document_path',
                'legal_status',
                'legal_review_note',
                'legal_reviewed_at',
            ]);
        });
    }
};
