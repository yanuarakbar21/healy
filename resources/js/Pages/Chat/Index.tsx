import { Head } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/ui/Card';
import DisclaimerBanner from '@/Components/Chat/DisclaimerBanner';
import ChatMessage from '@/Components/Chat/ChatMessage';
import ChatInput from '@/Components/Chat/ChatInput';

interface ChatMessageData {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatProps {
    recentSessions: Array<{ session_id: string; preview: string; created_at: string }>;
}

export default function Index({ recentSessions }: ChatProps) {
    const [messages, setMessages] = useState<ChatMessageData[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [streamingContent, setStreamingContent] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingContent]);

    const handleSend = useCallback(async (message: string) => {
        setMessages(prev => [...prev, { role: 'user', content: message }]);
        setIsStreaming(true);
        setStreamingContent('');
        setLoading(true);

        const echo = (window as any).Echo;
        if (echo && sessionId) {
            echo.leave(`chat.${(window as any).userId}`);
        }

        try {
            const res = await fetch('/api/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`,
                },
                body: JSON.stringify({ message, session_id: sessionId }),
            });
            const data = await res.json();
            const newSessionId = data.session_id;
            setSessionId(newSessionId);

            if (echo) {
                const userId = (window as any).userId;
                echo.channel(`chat.${userId}`)
                    .listen('MessageChunk', (e: any) => {
                        if (e.session_id === newSessionId) {
                            setStreamingContent(prev => prev + e.chunk);
                        }
                    });
            }
        } catch { /* ignore */ } finally {
            setLoading(false);
            setIsStreaming(false);
            if (streamingContent) {
                setMessages(prev => [...prev, { role: 'assistant', content: streamingContent }]);
                setStreamingContent('');
            }
        }
    }, [sessionId, streamingContent]);

    useEffect(() => {
        if (!loading && streamingContent && !isStreaming) {
            setMessages(prev => [...prev, { role: 'assistant', content: streamingContent }]);
            setStreamingContent('');
        }
    }, [loading, isStreaming, streamingContent]);

    return (
        <AppLayout>
            <Head title="AI Consultant - Healy" />
            <div className="max-w-3xl mx-auto h-[calc(100vh-10rem)] flex flex-col">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-on-surface font-[family-name:var(--font-family-heading)]">Healy AI Consultant</h1>
                    <DisclaimerBanner />
                </div>

                <Card padding={false} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
                        {messages.length === 0 && !isStreaming && (
                            <div className="flex items-center justify-center h-full text-center">
                                <div>
                                    <p className="text-4xl mb-3">💬</p>
                                    <p className="text-on-surface-variant text-sm">Ask me anything about your health!</p>
                                    <p className="text-xs text-on-surface-variant/60 mt-1">I can help with symptoms, nutrition, wellness, and more</p>
                                </div>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <ChatMessage key={i} role={msg.role} content={msg.content} />
                        ))}
                        {isStreaming && streamingContent && (
                            <ChatMessage role="assistant" content={streamingContent} isStreaming />
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <div className="border-t border-outline-variant/20 px-6 py-4">
                        <ChatInput onSend={handleSend} disabled={isStreaming} />
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
