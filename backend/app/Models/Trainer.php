<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trainer extends Model
{
    use HasFactory;

    protected $casts = [
        'hire_date' => 'date',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'employee_code',
        'specialization',
        'bio',
        'experience_years',
        'hire_date',
        'status',
    ];

    /**
     * Get the user that owns the trainer profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the members assigned to the trainer.
     */
    public function members(): HasMany
    {
        return $this->hasMany(Member::class);
    }
}
