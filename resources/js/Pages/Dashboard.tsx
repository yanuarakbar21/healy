import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import type { UserProfile, HealthAssessment } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DashboardProps {
    profile: UserProfile;
    latestAssessments: Record<string, HealthAssessment>;
    latestTips: Array<{
        id: string;
        title: string;
        title_id: string | null;
        slug: string;
        description: string;
        description_id: string | null;
        image_url: string | null;
        source: string;
        source_url: string;
        category: string;
        published_at: string;
    }>;
    historyByType: Array<{ type: string; data: Array<{ score: number; category: string; taken_at: string }> }>;
}

const categoryGradients: Record<string, string> = {
    disease: 'from-red-500/20 to-rose-500/10',
    nutrition: 'from-green-600/20 to-emerald-500/10',
    mental: 'from-violet-500/20 to-purple-500/10',
    exercise: 'from-orange-500/20 to-amber-500/10',
    general: 'from-teal-500/20 to-cyan-500/10',
};

const categoryAnimatedGradients: Record<string, string> = {
    disease: 'animated-grad-disease',
    nutrition: 'animated-grad-nutrition',
    mental: 'animated-grad-mental',
    exercise: 'animated-grad-exercise',
    general: 'animated-grad-general',
};

const categoryIcons: Record<string, string> = {
    disease: 'coronavirus',
    nutrition: 'nutrition',
    mental: 'psychology',
    exercise: 'exercise',
    general: 'info',
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'baru saja';
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} hari lalu`;
    return new Date(dateStr).toLocaleDateString('id-ID');
}

function getDateIndonesia() {
    const d = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Dashboard({ profile, latestAssessments, latestTips, historyByType }: DashboardProps) {
    const name = profile?.full_name?.split(' ')[0] ?? 'Pengguna';
    const hasProfile = !!(profile?.full_name && profile?.birth_date);
    const hasAssessments = Object.keys(latestAssessments).length > 0;
    const [tipsUpdatedAt, setTipsUpdatedAt] = useState(Date.now());

    const chartData = useMemo(() => {
        const dateMap = new Map<string, Record<string, number>>();
        historyByType.forEach(({ type, data }) => {
            data.forEach(({ score, taken_at }) => {
                const d = new Date(taken_at);
                const key = `${d.getDate()}/${d.getMonth() + 1}`;
                if (!dateMap.has(key)) dateMap.set(key, {});
                dateMap.get(key)![type] = score;
            });
        });
        return Array.from(dateMap.entries())
            .sort(([a], [b]) => {
                const [da, ma] = a.split('/').map(Number);
                const [db, mb] = b.split('/').map(Number);
                return da + ma * 31 - (db + mb * 31);
            })
            .map(([date, scores]) => ({ date, ...scores }));
    }, [historyByType]);

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['latestTips'], onSuccess: () => setTipsUpdatedAt(Date.now()) });
        }, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AppLayout>
            <Head title="Dashboard - Healy" />
            <div className="space-y-16">
                <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="font-display-lg text-[36px] md:text-[48px] text-primary mb-1">Halo, {name}!</h1>
                        <p className="font-body-lg text-on-surface-variant max-w-xl">Semoga harimu menyenangkan. Berikut adalah ringkasan kesehatanmu untuk hari ini.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-tertiary-fixed p-3 rounded-lg shadow-sm">
                        <span className="material-symbols-outlined text-primary">calendar_today</span>
                        <span className="font-label-md text-on-tertiary-fixed-variant">{getDateIndonesia()}</span>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-surface-container-lowest rounded-lg p-6 shadow-[0_10px_30px_-5px_rgba(2,103,131,0.06)] flex flex-col justify-between min-h-[220px] hover:scale-[1.02] transition-transform duration-300">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-primary-container/20 rounded-lg">
                                <span className="material-symbols-outlined text-primary">monitor_weight</span>
                            </div>
                            {latestAssessments.bmi && (
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-sm font-bold">
                                    {latestAssessments.bmi.category}
                                </span>
                            )}
                        </div>
                        <div className="mt-6">
                            <p className="text-on-surface-variant font-label-md uppercase tracking-wider">BMI & Komposisi Tubuh</p>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="font-headline-lg text-on-surface">
                                    {latestAssessments.bmi ? latestAssessments.bmi.score : '-'}
                                </span>
                                <span className="text-on-surface-variant font-body-md">kg/m²</span>
                            </div>
                        </div>
                        <div className="mt-6 w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: latestAssessments.bmi ? `${Math.min((latestAssessments.bmi.score / 40) * 100, 100)}%` : '0%' }} />
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest rounded-lg p-6 shadow-[0_10px_30px_-5px_rgba(2,103,131,0.06)] flex flex-col justify-between min-h-[220px] hover:scale-[1.02] transition-transform duration-300">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-secondary-container/30 rounded-lg">
                                <span className="material-symbols-outlined text-secondary">bloodtype</span>
                            </div>
                            {latestAssessments.diabetes_risk && (
                                <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full font-label-sm font-bold">
                                    {latestAssessments.diabetes_risk.category === 'low' ? 'Rendah' : latestAssessments.diabetes_risk.category === 'moderate' ? 'Sedang' : 'Tinggi'}
                                </span>
                            )}
                        </div>
                        <div className="mt-6">
                            <p className="text-on-surface-variant font-label-md uppercase tracking-wider">Risiko Diabetes</p>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="font-headline-lg text-on-surface">
                                    {latestAssessments.diabetes_risk ? latestAssessments.diabetes_risk.category : '-'}
                                </span>
                            </div>
                        </div>
                        {latestAssessments.diabetes_risk && (
                            <div className="mt-6 flex items-center gap-1">
                                <span className="material-symbols-outlined text-primary text-[18px]">trending_down</span>
                                <p className="text-on-surface-variant font-label-sm">Pantau rutin untuk hasil terbaik</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-surface-container-lowest rounded-lg p-6 shadow-[0_10px_30px_-5px_rgba(2,103,131,0.06)] flex flex-col justify-between min-h-[220px] hover:scale-[1.02] transition-transform duration-300">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-tertiary-container/20 rounded-lg">
                                <span className="material-symbols-outlined text-tertiary">psychology</span>
                            </div>
                            {latestAssessments.stress_pss10 && (
                                <span className="bg-tertiary/10 text-tertiary px-3 py-1 rounded-full font-label-sm font-bold">
                                    {latestAssessments.stress_pss10.category === 'low' ? 'Rendah' : latestAssessments.stress_pss10.category === 'moderate' ? 'Sedang' : 'Tinggi'}
                                </span>
                            )}
                        </div>
                        <div className="mt-6">
                            <p className="text-on-surface-variant font-label-md uppercase tracking-wider">Tingkat Stres</p>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="font-headline-lg text-on-surface">
                                    {latestAssessments.stress_pss10 ? latestAssessments.stress_pss10.score : '-'}
                                </span>
                                <span className="text-on-surface-variant font-body-md">/40</span>
                            </div>
                        </div>
                        <div className="mt-6 w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                            <div className="bg-tertiary h-full rounded-full" style={{ width: latestAssessments.stress_pss10 ? `${Math.min((latestAssessments.stress_pss10.score / 40) * 100, 100)}%` : '0%' }} />
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-surface-container-lowest rounded-lg p-10 shadow-[0_10px_30px_-5px_rgba(2,103,131,0.06)]">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="font-headline-md text-on-surface">Grafik Perkembangan</h2>
                            <span className="font-label-sm text-on-surface-variant">{historyByType.reduce((sum, t) => sum + t.data.length, 0)} hasil</span>
                        </div>
                        <div className="h-[250px] w-full">
                            {historyByType.some(t => t.data.length > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e9e8e5" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#3d4a40' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 12, fill: '#3d4a40' }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #bccabd', boxShadow: '0 8px 30px rgba(2,103,131,0.06)' }} />
                                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                                        <Bar dataKey="bmi" name="BMI" fill="#006d3e" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="diabetes_risk" name="Diabetes" fill="#026783" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="stress_pss10" name="Stres" fill="#4b6454" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-on-surface-variant">
                                    <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">bar_chart</span>
                                    <p className="font-body-md mt-3">Belum ada data. Lakukan skrining untuk melihat grafik perkembangan.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-primary text-on-primary rounded-lg p-10 shadow-xl relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary-container rounded-full opacity-20" />
                        <div className="relative z-10">
                            <div className="p-2 bg-white/20 rounded-full w-fit mb-6">
                                <span className="material-symbols-outlined text-[32px]">smart_toy</span>
                            </div>
                            <h3 className="font-headline-md mb-3">AI Consultant</h3>
                            <p className="font-body-md text-primary-fixed opacity-90 mb-10 leading-relaxed">
                                Punya pertanyaan tentang hasil pemeriksaanmu? Konsultasikan langsung dengan asisten kesehatan AI kami secara instan.
                            </p>
                        </div>
                        <Link href="/chat" className="relative z-10 w-full bg-white text-primary font-bold py-6 rounded-full hover:bg-surface-container-low transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2">
                            Chat dengan AI Consultant
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="font-headline-md text-on-surface">Tips Kesehatan Untukmu</h2>
                        <span className="font-label-sm text-on-surface-variant/50 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {new Date(tipsUpdatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <div className="flex overflow-x-auto pb-6 gap-6 scroll-smooth">
                        {latestTips.length === 0 ? (
                            <p className="font-body-md text-on-surface-variant">Belum ada tips kesehatan. Coba lagi nanti.</p>
                        ) : (
                            latestTips.map((tip) => {
                                const grad = categoryGradients[tip.category] ?? categoryGradients.general;
                                const icon = categoryIcons[tip.category] ?? categoryIcons.general;
                                return (
                                    <Link key={tip.id} href={`/tips/${tip.slug}`}
                                        className="flex-shrink-0 w-[300px] md:w-[350px] bg-surface-container-low rounded-lg overflow-hidden flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                                        <div className={`h-40 flex items-center justify-center relative overflow-hidden`}>
                                            {tip.image_url ? (
                                                <img src={tip.image_url} alt={tip.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className={`w-full h-full ${categoryAnimatedGradients[tip.category] ?? categoryAnimatedGradients.general} flex items-center justify-center`}>
                                                    <span className="material-symbols-outlined text-[56px] text-white/40 animate-float">{icon}</span>
                                                </div>
                                            )}
                                            <span className="absolute top-3 right-3 px-2 py-1 rounded-md text-[11px] font-label-sm bg-surface/80 backdrop-blur-sm text-on-surface">
                                                {tip.source}
                                            </span>
                                        </div>
                                        <div className="p-5 flex flex-col gap-2 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded text-[11px] font-label-sm bg-primary/10 text-primary">
                                                    {tip.category === 'general' ? 'info' : tip.category}
                                                </span>
                                                <span className="font-label-sm text-on-surface-variant/60">{timeAgo(tip.published_at)}</span>
                                            </div>
                                            <h4 className="font-headline-sm text-[16px] text-on-surface line-clamp-2 group-hover:text-primary transition-colors">{tip.title_id ?? tip.title}</h4>
                                            <p className="text-on-surface-variant font-body-sm line-clamp-2">{tip.description_id ?? tip.description}</p>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </section>

                {!hasProfile && (
                    <div className="bg-surface-container-lowest rounded-lg p-6 shadow-[0_10px_30px_-5px_rgba(2,103,131,0.06)] border-l-4 border-primary">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">info</span>
                            <p className="font-body-md text-on-surface">
                Lengkapi{' '}
                        <Link href="/profile" className="text-primary font-bold hover:underline">profil klinis</Link>
                        {' '}untuk mengaktifkan kalkulasi BMI dan wawasan kesehatan yang dipersonalisasi.
                    </p>
                        </div>
                    </div>
                )}

                {!hasAssessments && (
                    <div className="bg-surface-container-lowest rounded-lg p-10 text-center shadow-[0_10px_30px_-5px_rgba(2,103,131,0.06)]">
                        <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">health_metrics</span>
                        <p className="font-body-md text-on-surface-variant mb-6 mt-3">Belum ada penilaian kesehatan</p>
                        <Link href="/assessments" className="inline-flex items-center px-16 py-6 bg-primary text-on-primary rounded-full font-label-md shadow-lg hover:scale-105 active:scale-95 transition-transform">
                            Mulai Tes Pertama
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
