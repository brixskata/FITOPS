<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('equipment')
            ->whereNull('asset_code')
            ->orderBy('id')
            ->get(['id'])
            ->each(function (object $equipment): void {
                DB::table('equipment')
                    ->where('id', $equipment->id)
                    ->update([
                        'asset_code' => 'EQ-' . str_pad((string) $equipment->id, 6, '0', STR_PAD_LEFT),
                    ]);
            });

        DB::statement('ALTER TABLE `equipment` MODIFY `asset_code` VARCHAR(50) NOT NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE `equipment` MODIFY `asset_code` VARCHAR(50) NULL');
    }
};
