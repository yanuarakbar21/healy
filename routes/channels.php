<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\User;

Broadcast::channel('chat.{userId}', function (User $user, $userId) {
    return (string) $user->id === (string) $userId;
});
