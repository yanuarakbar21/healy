import { Head, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import ConfirmModal from '@/Components/ConfirmModal';

interface ChatAttachment {
    url: string;
    name: string;
    mime: string;
}

interface ChatMessageData {
    role: 'user' | 'assistant';
    content: string;
    attachments?: ChatAttachment[];
}

interface ChatProps {
    recentSessions: Array<{ session_id: string; preview: string; created_at: string }>;
}

export default function Index({ recentSessions }: ChatProps) {
    const { props: inertiaProps } = usePage();
    const user = (inertiaProps as any).auth?.user;
    const [messages, setMessages] = useState<ChatMessageData[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [streamingContent, setStreamingContent] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [input, setInput] = useState('');
    const [sessions, setSessions] = useState(recentSessions);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const chatWindowRef = useRef<HTMLDivElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const form = new FormData();
            form.append('file', file);
            const res = await fetch('/api/chat/upload', { method: 'POST', body: form });
            if (!res.ok) throw new Error('Gagal upload');
            const data = await res.json();
            setAttachments(prev => [...prev, data]);
        } catch {
            setError('Gagal mengunggah file');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleVoice = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Fitur suara tidak didukung di browser ini');
            return;
        }
        if (isRecording) return;
        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.continuous = false;
        recognition.interimResults = false;
        setIsRecording(true);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev ? prev + ' ' + transcript : transcript);
            setIsRecording(false);
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognition.start();
    };

    const loadSession = async (sid: string) => {
        setSessionId(sid);
        setMessages([]);
        setStreamingContent('');
        setError('');
        try {
            const res = await fetch(`/api/chat/history?session_id=${encodeURIComponent(sid)}`);
            if (!res.ok) throw new Error('Gagal memuat riwayat');
            const data = await res.json();
            setMessages(data.map((m: any) => ({ role: m.role, content: m.content })));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Gagal memuat riwayat');
        }
    };

    const handleDeleteSession = (sid: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteTarget(sid);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            const res = await fetch(`/api/chat/session/${encodeURIComponent(deleteTarget)}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Gagal menghapus');
            setSessions(prev => prev.filter(s => s.session_id !== deleteTarget));
            if (sessionId === deleteTarget) {
                setSessionId(null);
                setMessages([]);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Gagal menghapus');
        } finally {
            setDeleteTarget(null);
        }
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingContent]);

    useEffect(() => {
        if (!loading && streamingContent && !isStreaming) {
            setMessages(prev => [...prev, { role: 'assistant', content: streamingContent }]);
            setStreamingContent('');
        }
    }, [loading, isStreaming, streamingContent]);

    const handleSend = useCallback(async (message: string, fileAttachments?: ChatAttachment[]) => {
        const msgAttachments = fileAttachments ?? attachments;
        const attachmentUrls = msgAttachments.filter(a => a.mime.startsWith('image/')).map(a => a.url);
        setMessages(prev => [...prev, { role: 'user', content: message, attachments: msgAttachments }]);
        setAttachments([]);
        setError('');
        setStreamingContent('');
        setIsStreaming(true);
        setLoading(true);

        const echo = (window as any).Echo;
        let currentSessionId = sessionId;

        const res = await fetch('/api/chat/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, session_id: currentSessionId, attachments: attachmentUrls }),
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || `Server error (${res.status})`);
        }

        const data = await res.json();
        const newSessionId = data.session_id;
        setSessionId(newSessionId);

        if (data.content) {
            setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
        } else if (echo && user?.id) {
            if (currentSessionId) {
                echo.leave(`chat.${user.id}`);
            }
            echo.channel(`chat.${user.id}`)
                .listen('MessageChunk', (e: any) => {
                    if (e.session_id === newSessionId) {
                        setStreamingContent(prev => prev + e.chunk);
                    }
                });
        }
    }, [sessionId, user?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!input.trim() && attachments.length === 0) || isStreaming) return;
        const msg = input.trim() || '(file)';
        setInput('');
        try {
            await handleSend(msg, attachments);
        } catch (err: any) {
            setError(err.message || 'Gagal mengirim pesan. Coba lagi.');
        } finally {
            setLoading(false);
            setIsStreaming(false);
        }
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
                        {sessions?.length > 0 ? sessions.map((s, i) => (
                            <div key={s.session_id} onClick={() => loadSession(s.session_id)}
                                className={`p-4 rounded-lg shadow-sm border cursor-pointer transition-all group ${
                                    sessionId === s.session_id
                                        ? 'bg-primary/5 border-primary/30'
                                        : 'bg-surface-container-lowest border-outline-variant/20 hover:bg-white'
                                }`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-label-sm text-primary">{new Date(s.created_at).toLocaleDateString('id-ID')}</span>
                                    <button onClick={(e) => handleDeleteSession(s.session_id, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-error-container/20 transition-all"
                                        title="Hapus sesi">
                                        <span className="material-symbols-outlined text-[16px] text-error">delete</span>
                                    </button>
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
                        <button onClick={() => { setMessages([]); setSessionId(null); setStreamingContent(''); setError(''); }}
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
                                Healy AI Consultant dapat membaca dan menganalisis gambar yang dilampirkan. Format video dan dokumen belum didukung.
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
                                            <button key={i} onClick={async () => {
                                                try {
                                                    await handleSend(s);
                                                } catch (err: any) {
                                                    setError(err.message || 'Gagal mengirim.');
                                                } finally {
                                                    setLoading(false);
                                                    setIsStreaming(false);
                                                }
                                            }}
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
                                        <div className="max-w-[85%] md:max-w-[70%] bg-primary text-on-primary p-6 rounded-xl rounded-tr-none shadow-sm space-y-3">
                                            <p className="font-body-md">{msg.content}</p>
                                            {msg.attachments?.map((a, j) => (
                                                <div key={j} className="flex items-center gap-3 bg-white/15 rounded-lg px-4 py-2">
                                                    <span className="material-symbols-outlined text-lg shrink-0">
                                                        {a.mime.startsWith('image/') ? 'image' : a.mime.startsWith('video/') ? 'videocam' : 'description'}
                                                    </span>
                                                    <a href={a.url} target="_blank" rel="noopener noreferrer"
                                                        className="font-label-sm text-white/90 hover:underline truncate">{a.name}</a>
                                                </div>
                                            ))}
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

                            {error && (
                                <div className="flex justify-center">
                                    <div className="bg-error-container text-on-error-container px-6 py-3 rounded-xl font-body-md shadow-sm border border-error/20 max-w-lg text-center">
                                        <span className="material-symbols-outlined text-lg align-middle mr-2">error</span>
                                        {error}
                                    </div>
                                </div>
                            )}

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
                                <button type="submit" disabled={(attachments.length === 0 && !input.trim()) || isStreaming}
                                    className="absolute right-1.5 p-2.5 bg-primary text-on-primary rounded-full shadow-md active:scale-90 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                                    <span className="material-symbols-outlined">send</span>
                                </button>
                            </form>
                            <div className="flex items-center justify-between px-1 mt-3">
                                <div className="flex gap-6">
                                    <input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.txt" onChange={handleFileSelect} className="hidden" />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                                        className="flex items-center gap-1 font-label-sm text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50">
                                        <span className="material-symbols-outlined text-lg">{uploading ? 'hourglass_top' : 'attach_file'}</span>
                                        {uploading ? 'Mengupload...' : 'Lampiran'}
                                    </button>
                                    <button type="button" onClick={handleVoice} disabled={isRecording}
                                        className={`flex items-center gap-1 font-label-sm transition-colors disabled:opacity-50 ${isRecording ? 'text-error animate-pulse' : 'text-on-surface-variant hover:text-primary'}`}>
                                        <span className="material-symbols-outlined text-lg">{isRecording ? 'mic' : 'mic'}</span>
                                        {isRecording ? 'Merekam...' : 'Suara'}
                                    </button>
                                </div>
                                {loading && (
                                    <span className="font-label-sm text-primary animate-pulse italic">Healy sedang berpikir...</span>
                                )}
                            </div>
                            {attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 px-1 mt-2">
                                    {attachments.map((a, i) => (
                                        <span key={i} className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full font-label-sm text-xs">
                                            {a.name}
                                            <button type="button" onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                                                className="ml-1 hover:text-error transition-colors">
                                                <span className="material-symbols-outlined text-[14px]">close</span>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            <ConfirmModal
                open={deleteTarget !== null}
                title="Hapus Riwayat"
                message="Apakah Anda yakin ingin menghapus sesi percakapan ini? Tindakan ini tidak dapat dibatalkan."
                confirmLabel="Hapus"
                cancelLabel="Batal"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </AppLayout>
    );
}
