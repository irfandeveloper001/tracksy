<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seat_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('bus_id')->constrained()->onDelete('cascade');
            $table->string('seat_number');
            $table->date('trip_date');
            $table->enum('status', ['available', 'occupied', 'reserved'])->default('reserved');
            $table->timestamps();

            $table->unique(['bus_id', 'seat_number', 'trip_date']);
            $table->index(['bus_id', 'trip_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seat_assignments');
    }
};

