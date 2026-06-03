import { Link, usePage } from '@inertiajs/react';
import { ReactNode, useState } from 'react';

interface AppLayoutProps {
    children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const { url } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/assessments', label: 'Health Tests', icon: '🩺' },
        { href: '/chat', label: 'AI Consultant', icon: '💬' },
        { href: '/profile', label: 'Profile', icon: '👤' },
    ];

    return (
        <div className="min-h-screen bg-surface flex">
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-[4px_0_20px_rgba(2,103,131,0.04)] transform transition-transform duration-200 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-outline-variant/30">
                    <Link href="/dashboard" className="text-2xl font-bold text-primary font-[family-name:var(--font-family-heading)]">Healy</Link>
                </div>
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors
                                ${url.startsWith(item.href)
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-on-surface-variant hover:bg-surface-container'}`}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>
            <div className="flex-1 flex flex-col min-h-screen">
                <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 px-6 py-4 flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-surface-container">
                        <span className="text-xl">{sidebarOpen ? '✕' : '☰'}</span>
                    </button>
                    <h1 className="text-lg font-semibold text-on-surface font-[family-name:var(--font-family-heading)]">Healy</h1>
                </header>
                <main className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto">
                    {children}
                </main>
            </div>
            {sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/20 z-30 lg:hidden" />
            )}
        </div>
    );
}
