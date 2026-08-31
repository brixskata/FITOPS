<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    use HasFactory;

    public const DUE_SOON_DAYS = 7;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'category',
        'brand',
        'model',
        'condition',
        'status',
        'last_maintenance_at',
        'next_maintenance_at',
        'maintenance_notes',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'last_maintenance_at' => 'datetime',
            'next_maintenance_at' => 'datetime',
        ];
    }
}
