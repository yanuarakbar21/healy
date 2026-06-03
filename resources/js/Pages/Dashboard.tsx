import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Link } from '@inertiajs/react';
import type { UserProfile, HealthAssessment } from '@/types';

interface DashboardProps {
    profile: UserProfile;
    latestAssessments: Record<string, HealthAssessment>;
    historyByType: Array<{ type: string; data: Array<{ score: number; category: string; taken_at: string }> }>;
}

function getDateIndonesia() {
    const d = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Dashboard({ profile, latestAssessments, historyByType }: DashboardProps) {
    const name = profile?.full_name?.split(' ')[0] ?? 'Pengguna';
    const hasProfile = !!(profile?.full_name && profile?.birth_date);
    const hasAssessments = Object.keys(latestAssessments).length > 0;

    const tips = [
        { label: 'Mental Health', title: '5 Menit Meditasi untuk Mengurangi Stres', desc: 'Latihan pernapasan sederhana dapat membantu menurunkan tingkat kortisol Anda...', icon: 'self_improvement', color: 'text-secondary' },
        { label: 'Nutrition', title: 'Pilihan Karbohidrat Rendah Glikemik', desc: 'Menjaga kadar gula darah tetap stabil dengan pemilihan jenis makanan yang tepat...', icon: 'nutrition', color: 'text-primary' },
        { label: 'Exercise', title: 'Pentingnya Istirahat Aktif', desc: 'Berjalan kaki ringan di antara sesi kerja dapat meningkatkan fokus dan metabolisme...', icon: 'directions_walk', color: 'text-tertiary' },
    ];

    return (
        <AppLayout>
            <Head title="Dashboard - Healy" />
            <div className="space-y-xl">
                <section className="flex flex-col md:flex-row md:items-end justify-between gap-md">
                    <div>
                        <h1 className="font-display-lg text-[36px] md:text-display-lg text-primary mb-xs">Halo, {name}!</h1>
                        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">Semoga harimu menyenangkan. Berikut adalah ringkasan kesehatanmu untuk hari ini.</p>
                    </div>
                    <div className="flex items-center gap-sm bg-tertiary-fixed p-sm rounded-lg shadow-sm">
                        <span className="material-symbols-outlined text-primary">calendar_today</span>
                        <span className="font-label-md text-label-md text-on-tertiary-fixed-variant">{getDateIndonesia()}</span>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-surface-container-lowest rounded-lg p-md shadow-[0_10px_30px_-5px_rgba(2,103,131,0.06)] flex flex-col justify-between min-h-[220px] hover:scale-[1.02] transition-transform duration-300">
                        <div className="flex justify-between items-start">
                            <div className="p-base bg-primary-container/20 rounded-lg">
                                <span className="material-symbols-outlined text-primary">monitor_weight</span>
                            </div>
                            {latestAssessments.bmi && (
                                <span className={`bg-${latestAssessments.bmi.category === 'normal' ? 'primary' : 'secondary'}/10 text-${latestAssessments.bmi.category === 'normal' ? 'primary' : 'secondary'} px-sm py-xs rounded-full font-label-sm font-bold`}>
                                    {latestAssessments.bmi.category}
                                </span>
                            )}
                        </div>
                        <div className="mt-md">
                            <p className="text-on-surface-variant font-label-md uppercase tracking-wider">BMI & Komposisi Tubuh</p>
                            <div className="flex items-baseline gap-xs mt-xs">
                                <span className="font-headline-lg text-headline-lg text-on-surface">
                                    {latestAssessments.bmi ? latestAssessments.bmi.score : '-'}
                                </span>
                                <span className="text-on-surface-variant font-body-md">kg/m²</span>
                            </div>
                        </div>
                        <div className="mt-md w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: latestAssessments.bmi ? `${Math.min((latestAssessments.bmi.score / 40) * 100, 100)}%` : '0%' }} />
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest rounded-lg p-md shadow-[0_10px_30px_-5px_rgba(2,103,131,0.06)] flex flex-col justify-between min-h-[220px] hover:scale-[1.02] transition-transform duration-300">
                        <div className="flex justify-between items-start">
                            <div className="p-base bg-secondary-container/30 rounded-lg">
                                <span className="material-symbols-outlined text-secondary">bloodtype</span>
                            </div>
                            {latestAssessments.diabetes && (
                                <span className={`bg-${latestAssessments.diabetes.category === 'low' ? 'primary' : 'secondary'}/10 text-${latestAssessments.diabetes.category === 'low' ? 'primary' : 'secondary'} px-sm py-xs rounded-full font-label-sm font-bold`}>
                                    {latestAssessments.diabetes.category === 'low' ? 'Rendah' : latestAssessments.diabetes.category === 'moderate' ? 'Sedang' : 'Tinggi'}
                                </span>
                            )}
                        </div>
                        <div className="mt-md">
                            <p className="text-on-surface-variant font-label-md uppercase tracking-wider">Risiko Diabetes</p>
                            <div className="flex items-baseline gap-xs mt-xs">
                                <span className="font-headline-lg text-headline-lg text-on-surface">
                                    {latestAssessments.diabetes ? latestAssessments.diabetes.category : '-'}
                                </span>
                            </div>
                        </div>
                        {latestAssessments.diabetes && (
                            <div className="mt-md flex items-center gap-xs">
                                <span className="material-symbols-outlined text-primary text-[18px]">trending_down</span>
                                <p className="text-on-surface-variant font-label-sm">Pantau rutin untuk hasil terbaik</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-surface-container-lowest rounded-lg p-md shadow-[0_10px_30px_-5px_rgba(2,103,131,0.06)] flex flex-col justify-between min-h-[220px] hover:scale-[1.02] transition-transform duration-300">
                        <div className="flex justify-between items-start">
                            <div className="p-base bg-tertiary-container/20 rounded-lg">
                                <span className="material-symbols-outlined text-tertiary">psychology</span>
                            </div>
                            {latestAssessments.stress && (
                                <span className="bg-tertiary/10 text-tertiary px-sm py-xs rounded-full font-label-sm font-bold">
                                    {latestAssessments.stress.category === 'low' ? 'Rendah' : latestAssessments.stress.category === 'moderate' ? 'Sedang' : 'Tinggi'}
                                </span>
                            )}
                        </div>
                        <div className="mt-md">
                            <p className="text-on-surface-variant font-label-md uppercase tracking-wider">Tingkat Stres</p>
                            <div className="flex items-baseline gap-xs mt-xs">
                                <span className="font-headline-lg text-headline-lg text-on-surface">
                                    {latestAssessments.stress ? latestAssessments.stress.score : '-'}
                                </span>
                                <span className="text-on-surface-variant font-body-md">/100</span>
                            </div>
                        </div>
                        <div className="mt-md w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                            <div className="bg-tertiary h-full rounded-full" style={{ width: latestAssessments.stress ? `${latestAssessments.stress.score}%` : '0%' }} />
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-surface-container-lowest rounded-lg p-lg shadow-[0_10px_30px_-5px_rgba(2,103,131,0.06)]">
                        <div className="flex justify-between items-center mb-lg">
                            <h2 className="font-headline-md text-headline-md text-on-surface">Grafik Perkembangan</h2>
                            <select className="bg-surface-container-low border-none rounded-full px-md py-xs font-label-md text-on-surface-variant focus:ring-primary">
                                <option>7 Hari Terakhir</option>
                                <option>30 Hari Terakhir</option>
                            </select>
                        </div>
                        <div className="relative h-[250px] w-full bg-surface-container-low/50 rounded-lg overflow-hidden">
                            <div className="absolute inset-0 flex items-end px-md pb-md">
                                <div className="w-full flex items-end justify-between h-4/5 gap-base">
                                    {[40, 55, 45, 70, 50, 85, 65].map((h, i) => (
                                        <div key={i} className="w-full bg-primary/20 hover:bg-primary/40 transition-all rounded-t-lg" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-md flex justify-between px-md text-on-surface-variant font-label-sm">
                            <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
                        </div>
                    </div>

                    <div className="bg-primary text-on-primary rounded-lg p-lg shadow-xl relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary-container rounded-full opacity-20" />
                        <div className="relative z-10">
                            <div className="p-base bg-white/20 rounded-full w-fit mb-md">
                                <span className="material-symbols-outlined text-[32px]">smart_toy</span>
                            </div>
                            <h3 className="font-headline-md text-headline-md mb-sm">AI Consultant</h3>
                            <p className="font-body-md text-body-md text-primary-fixed opacity-90 mb-lg leading-relaxed">
                                Punya pertanyaan tentang hasil pemeriksaanmu? Konsultasikan langsung dengan asisten kesehatan AI kami secara instan.
                            </p>
                        </div>
                        <Link href="/chat" className="relative z-10 w-full bg-white text-primary font-bold py-md rounded-full hover:bg-surface-container-low transition-all active:scale-95 shadow-lg flex items-center justify-center gap-base">
                            Chat dengan AI Consultant
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                    </div>
                </section>

                <section className="space-y-md">
                    <h2 className="font-headline-md text-headline-md text-on-surface">Tips Kesehatan Untukmu</h2>
                    <div className="flex overflow-x-auto pb-md gap-6 no-scrollbar scroll-smooth">
                        {tips.map((tip, i) => (
                            <div key={i} className="min-w-[300px] md:min-w-[350px] bg-surface-container-low rounded-lg overflow-hidden flex flex-col">
                                <div className="h-40 bg-gradient-to-br from-primary-container/20 to-secondary-container/20 flex items-center justify-center">
                                    <span className={`material-symbols-outlined text-[64px] ${tip.color}`}>{tip.icon}</span>
                                </div>
                                <div className="p-md flex flex-col gap-sm">
                                    <span className={`font-label-md ${tip.color}`}>{tip.label}</span>
                                    <h4 className="font-headline-md text-[18px]">{tip.title}</h4>
                                    <p className="text-on-surface-variant font-body-md line-clamp-2">{tip.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {!hasProfile && (
                    <div className="bg-surface-container-lowest rounded-lg p-md shadow-[0_10px_30px_-5px_rgba(2,103,131,0.06)] border-l-4 border-primary">
                        <div className="flex items-center gap-sm">
                            <span className="material-symbols-outlined text-primary">info</span>
                            <p className="font-body-md text-body-md text-on-surface">
                Lengkapi{' '}
                        <Link href="/profile" className="text-primary font-bold hover:underline">profil klinis</Link>
                        {' '}untuk mengaktifkan kalkulasi BMI dan wawasan kesehatan yang dipersonalisasi.
                    </p>
                        </div>
                    </div>
                )}

                {!hasAssessments && (
                    <div className="bg-surface-container-lowest rounded-lg p-lg text-center shadow-[0_10px_30px_-5px_rgba(2,103,131,0.06)]">
                        <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">health_metrics</span>
                        <p className="font-body-md text-body-md text-on-surface-variant mb-md mt-sm">Belum ada penilaian kesehatan</p>
                        <Link href="/assessments" className="inline-flex items-center px-xl py-md bg-primary text-on-primary rounded-full font-label-md shadow-lg hover:scale-105 active:scale-95 transition-transform">
                            Mulai Tes Pertama
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
