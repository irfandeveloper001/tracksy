<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('bus_id')->constrained()->onDelete('cascade');
            $table->foreignId('route_id')->constrained()->onDelete('cascade');
            $table->timestamp('start_time');
            $table->timestamp('end_time')->nullable();
            $table->json('start_location')->nullable()->comment('{latitude, longitude}');
            $table->json('end_location')->nullable()->comment('{latitude, longitude}');
            $table->enum('status', ['not_started', 'in_progress', 'completed', 'cancelled'])->default('not_started');
            $table->decimal('distance', 10, 2)->nullable()->comment('Distance in kilometers');
            $table->integer('duration')->nullable()->comment('Duration in minutes');
            $table->integer('passenger_count')->default(0);
            $table->timestamps();

            $table->index(['driver_id', 'status']);
            $table->index(['bus_id', 'start_time']);
            $table->index('start_time');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};

