<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('route_stop', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained()->onDelete('cascade');
            $table->foreignId('stop_id')->constrained()->onDelete('cascade');
            $table->integer('order')->comment('Order of stop in route');
            $table->integer('estimated_time')->nullable()->comment('Estimated time from previous stop (minutes)');
            $table->timestamps();

            $table->unique(['route_id', 'stop_id']);
            $table->index(['route_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('route_stop');
    }
};

