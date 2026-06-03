<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionnaireTemplate extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'type',
        'questions',
        'scoring_rules',
        'version',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'questions' => 'array',
            'scoring_rules' => 'array',
            'active' => 'boolean',
        ];
    }
}
