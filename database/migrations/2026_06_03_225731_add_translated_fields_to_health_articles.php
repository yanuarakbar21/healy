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
        Schema::table('health_articles', function (Blueprint $table) {
            $table->text('title_id')->nullable()->after('title');
            $table->text('description_id')->nullable()->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('health_articles', function (Blueprint $table) {
            $table->dropColumn(['title_id', 'description_id']);
        });
    }
};
