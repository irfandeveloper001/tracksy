<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update bus_type enum to include 'luxury'
        DB::statement("ALTER TABLE buses MODIFY COLUMN bus_type ENUM('standard', 'premium', 'luxury') DEFAULT 'standard'");
    }

    public function down(): void
    {
        // Revert back to original enum
        DB::statement("ALTER TABLE buses MODIFY COLUMN bus_type ENUM('standard', 'premium') DEFAULT 'standard'");
    }
};
