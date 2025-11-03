<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trip_stops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained()->onDelete('cascade');
            $table->foreignId('stop_id')->constrained()->onDelete('cascade');
            $table->timestamp('scheduled_time');
            $table->timestamp('actual_time')->nullable();
            $table->integer('passengers_boarding')->default(0);
            $table->integer('passengers_alighting')->default(0);
            $table->timestamps();

            $table->index(['trip_id', 'scheduled_time']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trip_stops');
    }
};

