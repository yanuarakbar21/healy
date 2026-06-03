<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class MessageChunk implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public string $userId,
        public string $sessionId,
        public string $chunk,
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel('chat.' . $this->userId);
    }

    public function broadcastWith(): array
    {
        return [
            'session_id' => $this->sessionId,
            'chunk' => $this->chunk,
        ];
    }
}
