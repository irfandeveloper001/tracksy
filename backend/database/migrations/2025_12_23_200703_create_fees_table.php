<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('fee_type'); // tuition, transportation, etc.
            $table->decimal('amount', 10, 2);
            $table->string('semester')->nullable();
            $table->date('due_date');
            $table->enum('status', ['pending', 'paid', 'overdue'])->default('pending');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fees');
    }
};
