<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\Trainer;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TrainerSeeder extends Seeder
{
    /**
     * Development-only account for local Trainer workspace testing.
     * Email: trainer@fitops.test
     * Password: FitOpsTrainer123!
     */
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'trainer@fitops.test'],
            [
                'name' => 'Alex Rivera',
                'password' => Hash::make('FitOpsTrainer123!'),
            ],
        );

        $user->assignRole('Trainer');

        $trainer = Trainer::firstOrCreate(
            ['user_id' => $user->id],
            [
                'employee_code' => 'TRN-DEV-001',
                'specialization' => 'Strength and Conditioning',
                'bio' => 'Development Trainer account for local workspace testing.',
                'experience_years' => 5,
                'hire_date' => now()->toDateString(),
                'status' => 'active',
            ],
        );

        Member::query()
            ->whereNull('trainer_id')
            ->orderBy('id')
            ->limit(2)
            ->update(['trainer_id' => $trainer->id]);
    }
}
