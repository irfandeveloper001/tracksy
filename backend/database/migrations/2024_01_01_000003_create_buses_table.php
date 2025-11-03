<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('buses');
        Schema::create('buses', function (Blueprint $table) {
            $table->id();
            $table->string('bus_number')->unique();
            $table->string('license_plate')->unique();
            $table->enum('bus_type', ['standard', 'premium'])->default('standard');
            $table->integer('capacity');
            $table->foreignId('current_route_id')->nullable()->constrained('routes')->onDelete('set null');
            $table->foreignId('current_driver_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['active', 'inactive', 'maintenance', 'emergency'])->default('inactive');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'current_route_id']);
            $table->index('current_driver_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('buses');
    }
};

