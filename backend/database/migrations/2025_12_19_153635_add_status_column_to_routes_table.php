<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('routes', function (Blueprint $table) {
            if (!Schema::hasColumn('routes', 'status')) {
                $table->enum('status', ['active', 'inactive'])->default('active')->after('is_active');
            }
        });
        
        // Update existing records to sync status with is_active (only if status column exists)
        if (Schema::hasColumn('routes', 'status')) {
            DB::statement("UPDATE routes SET status = CASE WHEN is_active = 1 THEN 'active' ELSE 'inactive' END WHERE status IS NULL OR status = ''");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('routes', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
