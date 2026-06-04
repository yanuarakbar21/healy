import { Link, usePage } from '@inertiajs/react';
import { ReactNode, useEffect, useState } from 'react';
import { createEcho } from '@/hooks/useReverb';

interface AppLayoutProps {
    children: ReactNode;
}

const navItems = [
    { href: '/dashboard', label: 'Beranda', icon: 'home' },
    { href: '/assessments', label: 'Skrining', icon: 'health_metrics' },
    { href: '/chat', label: 'AI Consultant', icon: 'smart_toy' },
    { href: '/profile', label: 'Profil', icon: 'person' },
];

export default function AppLayout({ children }: AppLayoutProps) {
    const { url, props: inertiaProps } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notice, setNotice] = useState('');

    const showNotice = (msg: string) => {
        setNotice(msg);
        setTimeout(() => setNotice(''), 3000);
    };

    useEffect(() => {
        const auth = (inertiaProps as any).auth;
        if (auth?.user?.id && !(window as any).Echo) {
            const token = localStorage.getItem('supabase_token');
            if (token) {
                const echo = createEcho(auth.user.id, token);
                (window as any).Echo = echo;
                (window as any).userId = auth.user.id;
            }
        }
    }, [(inertiaProps as any).auth?.user?.id]);

    return (
        <div className="min-h-screen bg-surface flex">
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface-container-lowest shadow-[4px_0_30px_-5px_rgba(2,103,131,0.06)] transform transition-transform duration-200 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-outline-variant/20">
                    <Link href="/dashboard" className="font-headline-md font-bold text-primary">Healy</Link>
                </div>
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const active = url.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-md transition-colors
                                    ${active
                                        ? 'bg-primary/10 text-primary font-bold'
                                        : 'text-on-surface-variant hover:bg-surface-container'}`}
                            >
                                <span className={`material-symbols-outlined ${active ? 'text-primary' : 'text-on-surface-variant'}`}
                                    style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-outline-variant/20">
                    <div className="flex items-center gap-3 px-4 py-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm">info</span>
                        <span className="font-label-sm">Healy v1.0</span>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-h-screen">
                <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-outline-variant/20 px-6 py-4 flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-xl hover:bg-surface-container transition-colors">
                        <span className="material-symbols-outlined text-on-surface-variant">
                            {sidebarOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-3 relative">
                        <button onClick={() => showNotice('Fitur notifikasi akan segera hadir')}
                            className="material-symbols-outlined p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
                            notifications
                        </button>
                        <Link href="/profile" className="w-9 h-9 rounded-full border-2 border-primary-container bg-surface-container flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
                            <span className="material-symbols-outlined text-on-surface-variant text-xl leading-none">account_circle</span>
                        </Link>
                        {notice && (
                            <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-surface-container-high rounded-lg shadow-lg font-body-sm text-on-surface text-center z-50">
                                {notice}
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>

            {sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/20 z-30 lg:hidden" />
            )}
        </div>
    );
}
