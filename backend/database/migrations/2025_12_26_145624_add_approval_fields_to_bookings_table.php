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
        Schema::table('bookings', function (Blueprint $table) {
            $table->text('rejection_reason')->nullable()->after('status');
            $table->foreignId('admin_approved_by')->nullable()->constrained('users')->onDelete('set null')->after('rejection_reason');
            $table->timestamp('approved_at')->nullable()->after('admin_approved_by');
            $table->timestamp('rejected_at')->nullable()->after('approved_at');
        });
        
        // Update enum to include 'rejected' status
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'rejected') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['admin_approved_by']);
            $table->dropColumn(['rejection_reason', 'admin_approved_by', 'approved_at', 'rejected_at']);
        });
        
        // Revert enum
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending'");
    }
};
