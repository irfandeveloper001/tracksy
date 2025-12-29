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
        Schema::table('notifications', function (Blueprint $table) {
            // Make custom notification columns nullable so Laravel's notification system
            // can insert records without providing these values
            $table->string('notification_type')->nullable()->change();
            $table->string('title')->nullable()->change();
            $table->text('message')->nullable()->change();
            $table->string('status')->nullable()->change();
            $table->timestamp('sent_at')->nullable()->change();
            $table->string('audience_type')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            // Revert the columns back to NOT NULL
            // Note: This might fail if there are NULL values in these columns
            $table->string('notification_type')->nullable(false)->change();
            $table->string('title')->nullable(false)->change();
            $table->text('message')->nullable(false)->change();
            $table->string('status')->nullable(false)->change();
            $table->timestamp('sent_at')->nullable(false)->change();
            $table->string('audience_type')->nullable(false)->change();
        });
    }
};
