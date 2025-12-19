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
            $table->enum('audience_type', ['all', 'route', 'driver', 'student', 'custom'])->default('all')->after('type');
            $table->json('audience_ids')->nullable()->after('audience_type');
            $table->enum('status', ['draft', 'scheduled', 'sent', 'failed'])->default('draft')->after('read_at');
            $table->timestamp('sent_at')->nullable()->after('status');
            $table->string('notification_type')->default('info')->after('audience_type')->comment('info, warning, success, error');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn(['audience_type', 'audience_ids', 'status', 'sent_at', 'notification_type']);
        });
    }
};
