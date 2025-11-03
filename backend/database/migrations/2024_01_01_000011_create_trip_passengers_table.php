<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trip_passengers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('booking_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('boarding_stop_id')->constrained('stops')->onDelete('cascade');
            $table->foreignId('alighting_stop_id')->constrained('stops')->onDelete('cascade');
            $table->string('seat_number')->nullable();
            $table->boolean('checked_in')->default(false);
            $table->timestamp('checked_in_at')->nullable();
            $table->boolean('boarded')->default(false);
            $table->timestamp('boarded_at')->nullable();
            $table->boolean('alighted')->default(false);
            $table->timestamp('alighted_at')->nullable();
            $table->timestamps();

            $table->index(['trip_id', 'checked_in']);
            $table->index('student_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trip_passengers');
    }
};

