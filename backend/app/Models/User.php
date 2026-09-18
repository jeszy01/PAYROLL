<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;
       protected $connection = 'auth'; 

    public const ROLE_ADMIN = 'admin';
    public const ROLE_HR = 'hr';
public const ROLE_EMPLOYEE = 'employee';

public const ROLES = [self::ROLE_ADMIN, self::ROLE_HR, self::ROLE_EMPLOYEE];

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'employee_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isHr(): bool
    {
        return $this->role === self::ROLE_HR;
    }

    public function isEmployee(): bool
{
    return $this->role === self::ROLE_EMPLOYEE;
}

    public function hasRole(string ...$roles): bool
    {
        return in_array($this->role, $roles, true);
    }
}
