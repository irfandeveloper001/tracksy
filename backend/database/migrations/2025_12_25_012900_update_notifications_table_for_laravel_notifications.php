<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // First, add new columns for Laravel notifications if they don't exist
        Schema::table('notifications', function (Blueprint $table) {
            if (!Schema::hasColumn('notifications', 'notifiable_type')) {
                $table->string('notifiable_type')->nullable()->after('id');
            }
            if (!Schema::hasColumn('notifications', 'notifiable_id')) {
                $table->unsignedBigInteger('notifiable_id')->nullable()->after('notifiable_type');
            }
        });

        // Update existing records to have notifiable values from user_id
        DB::statement("UPDATE notifications SET notifiable_type = 'App\\\\Models\\\\User', notifiable_id = user_id WHERE notifiable_type IS NULL");

        // Now modify the type column from ENUM to VARCHAR
        Schema::table('notifications', function (Blueprint $table) {
            // Drop the existing type column
            $table->dropColumn('type');
        });

        // Add it back as VARCHAR
        Schema::table('notifications', function (Blueprint $table) {
            $table->string('type', 255)->after('notifiable_id');
        });

        // Add index for Laravel notifications
        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['notifiable_type', 'notifiable_id']);
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            // Revert type back to ENUM
            $table->dropColumn('type');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->enum('type', [
                'route_deviation',
                'delay',
                'seat_available',
                'stop_arrival',
                'safety',
                'emergency',
                'general',
                'fee_invoice'
            ])->after('user_id');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn(['notifiable_type', 'notifiable_id']);
        });
    }
};
