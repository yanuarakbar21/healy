import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

(window as any).Pusher = Pusher;

export function createEcho(userId: string, token: string): Echo {
    return new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        authorizer: (channel: any) => ({
            authorize: (socketId: string, callback: Function) => {
                fetch('/api/broadcasting/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        socket_id: socketId,
                        channel_name: channel.name,
                    }),
                })
                    .then(res => res.json())
                    .then(data => callback(false, data))
                    .catch(err => callback(true, err));
            },
        }),
        wsHost: import.meta.env.VITE_REVERB_HOST ?? 'localhost',
        wsPort: parseInt(import.meta.env.VITE_REVERB_PORT ?? '8080'),
        wssPort: 443,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
    });
}
