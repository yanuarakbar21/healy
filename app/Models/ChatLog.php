<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatLog extends Model
{
    const UPDATED_AT = null;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'user_id',
        'session_id',
        'role',
        'content',
        'encrypted',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'encrypted' => 'boolean',
            'metadata' => 'array',
        ];
    }

    public function profile()
    {
        return $this->belongsTo(Profile::class, 'user_id', 'id');
    }
}
