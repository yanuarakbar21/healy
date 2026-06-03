import Card from '@/Components/ui/Card';

interface ChatMessageProps {
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
}

export default function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
    const isUser = role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            {isUser ? (
                <div className="max-w-[80%] bg-primary text-on-primary px-5 py-3 rounded-[24px] rounded-br-md text-sm leading-relaxed">
                    {content}
                </div>
            ) : (
                <div className="max-w-[80%]">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-xs">H</span>
                        <span className="text-xs font-semibold text-secondary">Healy AI</span>
                    </div>
                    <div className="bg-white px-5 py-3 rounded-[24px] rounded-bl-md text-sm leading-relaxed text-on-surface shadow-sm">
                        {content}
                        {isStreaming && <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse" />}
                    </div>
                </div>
            )}
        </div>
    );
}
