<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $fillable = [
        'id',
        'email',
    ];

    protected $keyType = 'string';
    public $incrementing = false;

    public function profile()
    {
        return $this->hasOne(Profile::class, 'id', 'id');
    }
}
