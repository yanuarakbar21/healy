<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HealthAssessment extends Model
{
    public $timestamps = false;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'user_id',
        'type',
        'score',
        'category',
        'responses',
        'recommendation',
        'taken_at',
    ];

    protected function casts(): array
    {
        return [
            'responses' => 'array',
            'score' => 'decimal:2',
            'taken_at' => 'datetime',
        ];
    }

    public function profile()
    {
        return $this->belongsTo(Profile::class, 'user_id', 'id');
    }
}
