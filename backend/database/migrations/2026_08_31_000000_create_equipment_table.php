<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipment', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('asset_code', 50)->nullable()->unique();
            $table->string('category', 50)->index();
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->enum('condition', ['excellent', 'good', 'fair', 'poor', 'damaged'])->index();
            $table->enum('status', ['operational', 'under_maintenance', 'out_of_service', 'retired'])->default('operational')->index();
            $table->dateTime('last_maintenance_at')->nullable();
            $table->dateTime('next_maintenance_at')->nullable()->index();
            $table->text('maintenance_notes')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipment');
    }
};
