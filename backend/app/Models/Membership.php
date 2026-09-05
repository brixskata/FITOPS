<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Membership extends Model
{
    use HasFactory;

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'price' => 'decimal:2',
        'cost' => 'decimal:2',
        'auto_renew' => 'boolean',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'member_id',
        'membership_plan_id',
        'membership_number',
        'starts_at',
        'ends_at',
        'price',
        'cost',
        'status',
        'auto_renew',
    ];

    /**
     * Get the member that owns the membership.
     */
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    /**
     * Get the membership plan for the membership.
     */
    public function membershipPlan(): BelongsTo
    {
        return $this->belongsTo(MembershipPlan::class);
    }

    /**
     * Get the payments for the membership.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
