<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('membership_plans', function (Blueprint $table) {
            $table->decimal('cost', 10, 2)->default(0)->after('price');
        });

        Schema::table('memberships', function (Blueprint $table) {
            $table->decimal('cost', 10, 2)->default(0)->after('price');
        });

        DB::statement('UPDATE memberships INNER JOIN membership_plans ON membership_plans.id = memberships.membership_plan_id SET memberships.cost = membership_plans.cost');
    }

    public function down(): void
    {
        Schema::table('memberships', fn (Blueprint $table) => $table->dropColumn('cost'));
        Schema::table('membership_plans', fn (Blueprint $table) => $table->dropColumn('cost'));
    }
};
