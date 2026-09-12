<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained('equipment')->restrictOnDelete();
            $table->date('maintenance_date')->index();
            $table->string('maintenance_type', 50);
            $table->text('description');
            $table->decimal('cost', 10, 2);
            $table->string('status', 30)->index();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['equipment_id', 'maintenance_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_records');
    }
};
