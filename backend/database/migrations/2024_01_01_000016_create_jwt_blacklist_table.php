<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jwt_blacklist', function (Blueprint $table) {
            $table->string('jti')->primary();
            $table->timestamp('exp');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jwt_blacklist');
    }
};

