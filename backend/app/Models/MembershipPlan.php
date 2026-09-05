<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MembershipPlan extends Model
{
    use HasFactory;

    protected $casts = [
        'price' => 'decimal:2',
        'cost' => 'decimal:2',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'duration_days',
        'price',
        'cost',
        'status',
    ];

    /**
     * Get the memberships for the plan.
     */
    public function memberships(): HasMany
    {
        return $this->hasMany(Membership::class);
    }
}
