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
        if (!Schema::hasTable('settings')) {
            return;
        }

        Schema::table('settings', function (Blueprint $table) {
            if (!Schema::hasColumn('settings', 'key')) {
                $table->string('key');
            }
            if (!Schema::hasColumn('settings', 'category')) {
                $table->string('category')->default('system');
            }
            if (!Schema::hasColumn('settings', 'value')) {
                $table->text('value')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('settings')) {
            return;
        }

        Schema::table('settings', function (Blueprint $table) {
            if (Schema::hasColumn('settings', 'value')) {
                $table->dropColumn('value');
            }
            if (Schema::hasColumn('settings', 'category')) {
                $table->dropColumn('category');
            }
            if (Schema::hasColumn('settings', 'key')) {
                $table->dropColumn('key');
            }
        });
    }
};
