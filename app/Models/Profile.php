<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $fillable = [
        'id',
        'full_name',
        'birth_date',
        'gender',
        'height_cm',
        'weight_kg',
        'allergies',
    ];

    protected $keyType = 'string';
    public $incrementing = false;

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'height_cm' => 'decimal:1',
            'weight_kg' => 'decimal:1',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id', 'id');
    }

    public function assessments()
    {
        return $this->hasMany(HealthAssessment::class, 'user_id', 'id');
    }

    public function chatLogs()
    {
        return $this->hasMany(ChatLog::class, 'user_id', 'id');
    }
}
