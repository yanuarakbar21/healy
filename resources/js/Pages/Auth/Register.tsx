import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { data, error: authError } = await supabase.auth.signUp({
            email, password,
            options: { data: { full_name: fullName } },
        });
        if (authError) { setError(authError.message); setLoading(false); return; }
        if (data?.user?.identities?.length === 0) { setError('Email sudah terdaftar'); setLoading(false); return; }
        setLoading(false);
        if (data?.session) {
            localStorage.setItem('supabase_token', data.session.access_token);
            const res = await fetch('/api/auth/callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: data.session.access_token }),
            });
            if (res.ok) { window.location.href = '/dashboard'; return; }
        }
        window.location.href = '/login?registered=1';
    };

    return (
        <>
            <Head title="Daftar - Healy" />
            <div className="min-h-screen bg-surface flex flex-col">
                <header className="px-5 md:px-[120px] py-4 max-w-7xl mx-auto w-full">
                    <Link href="/" className="font-headline-md text-headline-md font-bold text-primary">Healy</Link>
                </header>
                <div className="flex-1 flex items-center justify-center px-5">
                    <div className="w-full max-w-md">
                        <div className="bg-surface-container-lowest rounded-lg p-lg md:p-xl shadow-[0_30px_60px_-15px_rgba(2,103,131,0.06)]">
                            <div className="text-center mb-xl">
                                <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-md">
                                    <span className="material-symbols-outlined text-primary text-3xl">how_to_reg</span>
                                </div>
                                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">Buat Akun</h1>
                                <p className="font-body-md text-body-md text-on-surface-variant">Mulai perjalanan kesehatan Anda</p>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="font-label-md text-label-md text-on-surface mb-1 block">Nama Lengkap</label>
                                    <input
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        placeholder="Nama Lengkap"
                                        required
                                        className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="font-label-md text-label-md text-on-surface mb-1 block">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="nama@email.com"
                                        required
                                        className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="font-label-md text-label-md text-on-surface mb-1 block">Kata Sandi</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Minimal 6 karakter"
                                        required
                                        minLength={6}
                                        className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                                {error && <p className="text-sm text-error font-label-sm">{error}</p>}
                                <button type="submit" disabled={loading}
                                    className="w-full py-3 bg-primary text-on-primary rounded-full font-label-md shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    {loading ? 'Mendaftarkan...' : 'Daftar'}
                                </button>
                            </form>
                            <p className="text-center font-body-md text-body-md text-on-surface-variant mt-6">
                                Sudah punya akun?{' '}
                                <Link href="/login" className="text-primary font-bold hover:underline">Masuk</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
