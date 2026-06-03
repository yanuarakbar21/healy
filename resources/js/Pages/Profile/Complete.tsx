import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import type { UserProfile } from '@/types';

interface ProfileProps {
    profile: UserProfile;
}

export default function Complete({ profile }: ProfileProps) {
    const { data, setData, put, processing, errors } = useForm({
        full_name: profile?.full_name ?? '',
        birth_date: profile?.birth_date ?? '',
        gender: profile?.gender ?? 'male',
        height_cm: profile?.height_cm?.toString() ?? '',
        weight_kg: profile?.weight_kg?.toString() ?? '',
        allergies: profile?.allergies ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/api/profile');
    };

    return (
        <AppLayout>
            <Head title="Profil - Healy" />
            <div className="max-w-[1200px] mx-auto space-y-16">
                <section className="flex flex-col md:flex-row items-center md:items-end gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-[0_10px_30px_-5px_rgba(2,103,131,0.06)] overflow-hidden bg-surface-container flex items-center justify-center">
                            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">person</span>
                        </div>
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="font-headline-lg text-[28px] md:text-[32px] text-on-surface">
                            {data.full_name || 'Lengkapi Profil'}
                        </h1>
                        <p className="font-body-md text-on-surface-variant">Atur data diri dan informasi klinis Anda</p>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-8 bg-surface-container-lowest rounded-lg p-6 shadow-[0_10px_30px_-5px_rgba(2,103,131,0.06)]">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-primary">person</span>
                            <h2 className="font-headline-md text-primary">Data Diri</h2>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="font-label-md text-on-surface mb-1 block">Nama Lengkap</label>
                                    <input value={data.full_name} onChange={e => setData('full_name', e.target.value)}
                                        className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                                    {errors.full_name && <span className="text-xs text-error font-label-sm">{errors.full_name}</span>}
                                </div>
                                <div>
                                    <label className="font-label-md text-on-surface mb-1 block">Tanggal Lahir</label>
                                    <input type="date" value={data.birth_date} onChange={e => setData('birth_date', e.target.value)}
                                        className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                                    {errors.birth_date && <span className="text-xs text-error font-label-sm">{errors.birth_date}</span>}
                                </div>
                                <div>
                                    <label className="font-label-md text-on-surface mb-1 block">Jenis Kelamin</label>
                                    <div className="flex gap-3">
                                        {['male', 'female'].map(g => (
                                            <button key={g} type="button" onClick={() => setData('gender', g)}
                                                className={`flex-1 py-3 rounded-xl font-label-md transition-all ${
                                                    data.gender === g
                                                        ? 'bg-primary text-on-primary'
                                                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                                                }`}>
                                                {g === 'male' ? 'Laki-laki' : 'Perempuan'}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.gender && <span className="text-xs text-error font-label-sm">{errors.gender}</span>}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-label-md text-on-surface mb-1 block">Tinggi (cm)</label>
                                        <input type="number" step="0.1" value={data.height_cm} onChange={e => setData('height_cm', e.target.value)}
                                            className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                                        {errors.height_cm && <span className="text-xs text-error font-label-sm">{errors.height_cm}</span>}
                                    </div>
                                    <div>
                                        <label className="font-label-md text-on-surface mb-1 block">Berat (kg)</label>
                                        <input type="number" step="0.1" value={data.weight_kg} onChange={e => setData('weight_kg', e.target.value)}
                                            className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                                        {errors.weight_kg && <span className="text-xs text-error font-label-sm">{errors.weight_kg}</span>}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="font-label-md text-on-surface mb-1 block">Alergi</label>
                                    <textarea value={data.allergies} onChange={e => setData('allergies', e.target.value)}
                                        className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-md text-on-surface resize-none h-24 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="cth. Kacang tanah, seafood" />
                                    {errors.allergies && <span className="text-xs text-error font-label-sm">{errors.allergies}</span>}
                                </div>
                            </div>
                            <button type="submit" disabled={processing}
                                className="w-full mt-10 py-3 bg-primary text-on-primary rounded-full font-label-md shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                                {processing ? 'Menyimpan...' : 'Simpan Profil'}
                            </button>
                        </form>
                    </div>

                    <div className="md:col-span-4 space-y-6">
                        <div className="bg-primary-container text-on-primary-container rounded-lg p-6 shadow-[0_10px_30px_-5px_rgba(2,103,131,0.06)] flex flex-col justify-between overflow-hidden relative">
                            <div className="z-10">
                                <h3 className="font-label-md uppercase opacity-80">Skor Kesehatan</h3>
                                <p className="font-display-lg">--<span className="font-headline-md">/100</span></p>
                            </div>
                            <div className="z-10 mt-6">
                                <p className="font-body-md">Lengkapi profil untuk melihat skor kesehatan.</p>
                            </div>
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-on-primary-fixed-variant/10 rounded-full blur-2xl" />
                        </div>

                        <div className="bg-surface-container-lowest rounded-lg p-6 shadow-[0_10px_30px_-5px_rgba(2,103,131,0.06)]">
                            <h2 className="font-headline-md text-primary mb-6">Pengaturan</h2>
                            <div className="space-y-2">
                                <button className="w-full flex items-center justify-between p-3 hover:bg-surface-container transition-colors rounded-md group">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-outline group-hover:text-primary">notifications_active</span>
                                        <span className="font-body-md">Notifikasi</span>
                                    </div>
                                    <span className="material-symbols-outlined text-outline">chevron_right</span>
                                </button>
                                <button className="w-full flex items-center justify-between p-3 hover:bg-surface-container transition-colors rounded-md group">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-outline group-hover:text-primary">language</span>
                                        <span className="font-body-md">Bahasa</span>
                                    </div>
                                    <span className="material-symbols-outlined text-outline">chevron_right</span>
                                </button>
                                <hr className="my-6 border-outline-variant/30" />
                                <Link href="/login" method="post" as="button"
                                    className="w-full flex items-center justify-center gap-2 text-error font-label-md py-2 hover:bg-error-container/10 rounded-md transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">logout</span>
                                    Keluar
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
