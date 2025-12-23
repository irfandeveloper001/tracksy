<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('universities')) {
            return; // Table already exists, skip migration
        }
        
        Schema::create('universities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('address')->nullable();
            $table->integer('city_id')->nullable(); // Reference to city ID from JSON data, not a foreign key
            $table->string('city_name')->nullable(); // Cache city name for quick access
            $table->string('state_name')->nullable();
            $table->string('country_name')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('website')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['city_id']);
            $table->index(['name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('universities');
    }
};
