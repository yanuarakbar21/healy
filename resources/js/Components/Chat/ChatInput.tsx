import { useState } from 'react';
import Button from '@/Components/ui/Button';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || disabled) return;
        onSend(input.trim());
        setInput('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-3">
            <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Describe your symptoms or ask a health question..."
                disabled={disabled}
                className="flex-1 rounded-full border border-outline bg-surface px-5 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
            <Button type="submit" disabled={disabled || !input.trim()} size="md">
                Send
            </Button>
        </form>
    );
}
