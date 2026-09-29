<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AttendanceCutoff extends Model
{
    use HasUuids;
    protected $connection = 'attendance';

    protected $fillable = ['label', 'period_start', 'period_end', 'locked_at'];

    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'locked_at' => 'datetime',
        ];
    }

    public function entries(): HasMany
    {
        return $this->hasMany(AttendanceCutoffEntry::class);
    }
}