import { Head } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';

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
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const chatWindowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingContent]);

    useEffect(() => {
        if (!loading && streamingContent && !isStreaming) {
            setMessages(prev => [...prev, { role: 'assistant', content: streamingContent }]);
            setStreamingContent('');
        }
    }, [loading, isStreaming, streamingContent]);

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
        }
    }, [sessionId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isStreaming) return;
        handleSend(input.trim());
        setInput('');
    };

    const suggestions = ['Tips diet sehat', 'Gejala sakit kepala', 'Kualitas tidur'];

    return (
        <AppLayout>
            <Head title="AI Consultant - Healy" />
            <div className="flex h-[calc(100vh-10rem)] overflow-hidden bg-surface-bright rounded-lg shadow-[0_10px_30px_-5px_rgba(2,103,131,0.06)] border border-outline-variant/20">
                <aside className="hidden lg:flex flex-col w-80 bg-surface-container-low border-r border-outline-variant/30 p-6">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="font-headline-md text-on-surface">Riwayat</h2>
                        <button className="p-1 rounded-full hover:bg-surface-container transition-colors">
                            <span className="material-symbols-outlined text-on-surface-variant">edit_square</span>
                        </button>
                    </div>
                    <div className="space-y-3 overflow-y-auto chat-scroll flex-1">
                        {recentSessions?.length > 0 ? recentSessions.map((s, i) => (
                            <div key={i} className="p-6 bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/20 cursor-pointer hover:bg-white transition-all group">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-label-sm text-primary">{new Date(s.created_at).toLocaleDateString('id-ID')}</span>
                                </div>
                                <p className="font-body-md text-on-surface line-clamp-1">{s.preview}</p>
                            </div>
                        )) : (
                            <div className="text-center py-16">
                                <span className="material-symbols-outlined text-[40px] text-on-surface-variant/30">chat</span>
                                <p className="font-label-sm text-on-surface-variant mt-3">Belum ada riwayat</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-6 pt-6 border-t border-outline-variant/30">
                        <button onClick={() => { setMessages([]); setSessionId(null); }}
                            className="w-full flex items-center justify-center gap-3 p-3 bg-primary text-on-primary rounded-full font-label-md shadow-md hover:opacity-90 transition-all active:scale-95">
                            <span className="material-symbols-outlined">add</span>
                            Sesi Baru
                        </button>
                    </div>
                </aside>

                <section className="flex-1 flex flex-col">
                    <div className="w-full bg-tertiary-fixed/30 py-1 px-6 border-b border-tertiary-fixed-dim/50">
                        <div className="max-w-3xl mx-auto flex items-center gap-3">
                            <span className="material-symbols-outlined text-tertiary text-sm">info</span>
                            <p className="font-label-sm text-on-tertiary-fixed-variant leading-tight">
                                Healy AI Consultant memberikan informasi berbasis edukasi kesehatan umum dan tidak menggantikan diagnosis medis dari dokter profesional.
                            </p>
                        </div>
                    </div>

                    <div ref={chatWindowRef} className="flex-1 overflow-y-auto chat-scroll px-5 md:px-10 py-10 space-y-10">
                        <div className="max-w-3xl mx-auto space-y-10">
                            {messages.length === 0 && !isStreaming && (
                                <div className="flex flex-col items-center text-center mb-16 space-y-6">
                                    <div className="w-16 h-16 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-lg">
                                        <span className="material-symbols-outlined text-4xl">neurology</span>
                                    </div>
                                    <h1 className="font-headline-md text-on-surface">Halo! Saya Healy AI Consultant</h1>
                                    <p className="font-body-lg text-on-surface-variant max-w-md">Apa yang ingin Anda konsultasikan hari ini? Saya siap membantu memberikan informasi kesehatan yang terpercaya.</p>
                                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                                        {suggestions.map((s, i) => (
                                            <button key={i} onClick={() => { setInput(s); handleSubmit(new Event('submit') as any); }}
                                                className="px-6 py-3 bg-surface-container-high rounded-full font-label-sm text-primary hover:bg-primary-container hover:text-on-primary-container transition-all">
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                msg.role === 'user' ? (
                                    <div key={i} className="flex justify-end">
                                        <div className="max-w-[85%] md:max-w-[70%] bg-primary text-on-primary p-6 rounded-xl rounded-tr-none shadow-sm">
                                            <p className="font-body-md">{msg.content}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div key={i} className="flex justify-start">
                                        <div className="flex items-start gap-3 max-w-[85%] md:max-w-[70%]">
                                            <div className="w-8 h-8 shrink-0 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container mt-1">
                                                <span className="material-symbols-outlined text-sm">neurology</span>
                                            </div>
                                            <div className="bg-secondary-container text-on-secondary-container p-6 rounded-xl rounded-tl-none shadow-sm">
                                                <p className="font-body-md leading-relaxed">{msg.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            ))}

                            {isStreaming && streamingContent && (
                                <div className="flex justify-start">
                                    <div className="flex items-start gap-3 max-w-[85%] md:max-w-[70%]">
                                        <div className="w-8 h-8 shrink-0 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container mt-1">
                                            <span className="material-symbols-outlined text-sm">neurology</span>
                                        </div>
                                        <div className="bg-secondary-container text-on-secondary-container p-6 rounded-xl rounded-tl-none shadow-sm">
                                            <p className="font-body-md leading-relaxed typing-cursor">{streamingContent}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>
                    </div>

                    <div className="p-6 bg-surface-bright/80 backdrop-blur-sm border-t border-outline-variant/20">
                        <div className="max-w-3xl mx-auto">
                            <form onSubmit={handleSubmit} className="relative flex items-center">
                                <input type="text" value={input} onChange={e => setInput(e.target.value)}
                                    placeholder="Tanyakan sesuatu pada Healy..."
                                    disabled={isStreaming}
                                    className="w-full bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-6 py-3 font-body-md text-on-surface placeholder:text-on-surface-variant/50 transition-all chat-scroll"
                                />
                                <button type="submit" disabled={!input.trim() || isStreaming}
                                    className="absolute right-1.5 p-2.5 bg-primary text-on-primary rounded-full shadow-md active:scale-90 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                                    <span className="material-symbols-outlined">send</span>
                                </button>
                            </form>
                            <div className="flex items-center justify-between px-1 mt-3">
                                <div className="flex gap-6">
                                    <button className="flex items-center gap-1 font-label-sm text-on-surface-variant hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-lg">attach_file</span>
                                        Lampiran
                                    </button>
                                    <button className="flex items-center gap-1 font-label-sm text-on-surface-variant hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-lg">mic</span>
                                        Suara
                                    </button>
                                </div>
                                {loading && (
                                    <span className="font-label-sm text-primary animate-pulse italic">Healy sedang berpikir...</span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
