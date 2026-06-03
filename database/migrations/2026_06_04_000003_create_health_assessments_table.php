<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('health_assessments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('type');
            $table->decimal('score', 5, 2);
            $table->string('category');
            $table->jsonb('responses');
            $table->text('recommendation')->nullable();
            $table->timestampTz('taken_at')->useCurrent();
            $table->foreign('user_id')->references('id')->on('profiles')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('health_assessments');
    }
};
