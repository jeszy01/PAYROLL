<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    public const ROLE_ADMIN = 'admin';
    public const ROLE_HR_STAFF = 'hr_staff';

    /**
     * The complete list of valid roles. There are exactly two roles in
     * this system — nothing else may be created or assigned.
     */
    public const ROLES = [
        self::ROLE_ADMIN,
        self::ROLE_HR_STAFF,
    ];

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
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

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isHrStaff(): bool
    {
        return $this->role === self::ROLE_HR_STAFF;
    }
}
