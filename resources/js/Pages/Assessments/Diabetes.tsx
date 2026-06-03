import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';

const questions = [
    { id: 'age_group', text: 'Berapa usia Anda?', category: 'Data Diri', options: [['1', 'Di bawah 25 tahun', ''], ['2', '25 - 34 tahun', ''], ['3', '35 - 44 tahun', ''], ['4', '45 - 54 tahun', ''], ['5', '55 tahun atau lebih', '']] },
    { id: 'family_history', text: 'Apakah Anda memiliki riwayat diabetes dalam keluarga?', category: 'Riwayat Keluarga', options: [['no', 'Tidak', ''], ['yes', 'Ya', '']] },
    { id: 'activity', text: 'Bagaimana tingkat aktivitas fisik Anda?', category: 'Gaya Hidup', options: [['1', 'Aktif (olahraga rutin)', ''], ['2', 'Sedang (kadang-kadang)', ''], ['3', 'Kurang (jarang bergerak)', '']] },
    { id: 'diet', text: 'Bagaimana pola makan Anda sehari-hari?', category: 'Pola Makan', options: [['1', 'Seimbang dengan banyak sayur', ''], ['2', 'Cukup bervariasi', ''], ['3', 'Tinggi gula/makanan olahan', '']] },
    { id: 'waist', text: 'Bagaimana lingkar pinggang Anda?', category: 'Antropometri', options: [['1', 'Dalam rentang sehat', ''], ['2', 'Sedikit di atas normal', ''], ['3', 'Jauh di atas normal', '']] },
    { id: 'hypertension', text: 'Apakah Anda memiliki tekanan darah tinggi?', category: 'Kondisi Medis', options: [['no', 'Tidak', ''], ['yes', 'Ya', '']] },
    { id: 'high_blood_sugar', text: 'Apakah Anda pernah diberi tahu memiliki gula darah tinggi?', category: 'Kondisi Medis', options: [['no', 'Tidak', ''], ['yes', 'Ya', '']] },
];

const icons = ['person', 'family_history', 'directions_run', 'nutrition', 'straighten', 'bloodpressure', 'monitor_heart'];

export default function Diabetes() {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [step, setStep] = useState(0);
    const [result, setResult] = useState<{ score: number; category: string; recommendation: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const current = questions[step];

    const handleAnswer = (value: string) => {
        setAnswers(prev => ({ ...prev, [current.id]: value }));
        if (step < questions.length - 1) setStep(step + 1);
    };

    const handlePrev = () => { if (step > 0) setStep(step - 1); };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/assessments/diabetes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('supabase_token')}` },
                body: JSON.stringify(answers),
            });
            const data = await res.json();
            setResult(data);
        } catch { /* ignore */ } finally { setLoading(false); }
    };

    if (result) {
        return (
            <AppLayout>
                <Head title="Skrining Diabetes - Healy" />
                <div className="max-w-xl mx-auto">
                    <div className="bg-surface-container-lowest rounded-lg p-lg md:p-xl shadow-[0_30px_60px_-15px_rgba(2,103,131,0.06)] text-center">
                        <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-md">
                            <span className="material-symbols-outlined text-primary text-3xl">bloodtype</span>
                        </div>
                        <p className="font-label-md text-label-md text-on-surface-variant">Skor Risiko Diabetes Anda</p>
                        <p className="font-display-lg text-display-lg text-primary my-3">{result.score}</p>
                        <span className={`inline-block px-sm py-xs rounded-full font-label-sm font-bold ${
                            result.category === 'low' ? 'bg-primary/10 text-primary' :
                            result.category === 'moderate' ? 'bg-secondary/10 text-secondary' :
                            'bg-error-container/50 text-error'
                        }`}>{result.category === 'low' ? 'Rendah' : result.category === 'moderate' ? 'Sedang' : 'Tinggi'}</span>
                        <p className="font-body-md text-body-md text-on-surface mt-4 leading-relaxed">{result.recommendation}</p>
                        <button onClick={() => { setResult(null); setStep(0); setAnswers({}); }}
                            className="mt-6 px-xl py-md bg-primary text-on-primary rounded-full font-label-md shadow-lg hover:scale-105 active:scale-95 transition-all">
                            Ulangi Tes
                        </button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Skrining Diabetes - Healy" />
            <div className="max-w-3xl mx-auto">
                <div className="mb-xl text-center">
                    <div className="flex justify-between items-end mb-sm">
                        <span className="font-label-md text-label-md text-primary font-bold">Langkah {step + 1} dari {questions.length}</span>
                        <span className="font-label-md text-label-md text-on-surface-variant">{Math.round(((step + 1) / questions.length) * 100)}% Selesai</span>
                    </div>
                    <div className="h-4 w-full bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full bg-primary-container rounded-full progress-glow transition-all duration-700 ease-out" style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
                    </div>
                </div>

                <div className="bg-surface-container-lowest rounded-lg p-lg md:p-xl shadow-[0_30px_60px_-15px_rgba(2,103,131,0.06)]">
                    <div className="mb-lg">
                        <span className="inline-block px-sm py-xs bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full font-label-sm uppercase tracking-wider mb-md">
                            {current.category}
                        </span>
                        <div className="flex items-start gap-md">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-container/20 shrink-0">
                                <span className="material-symbols-outlined text-primary">{icons[step]}</span>
                            </div>
                            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface leading-tight">
                                {current.text}
                            </h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-md">
                        {current.options.map(([value, label]) => (
                            <button key={value} onClick={() => handleAnswer(value)}
                                className={`group flex items-center p-md border-[1.5px] border-outline-variant rounded-lg bg-surface transition-all duration-300 hover:border-primary hover:bg-surface-container-low text-left ${
                                    answers[current.id] === value ? 'border-primary bg-primary/5' : ''
                                }`}>
                                <div className="flex-1">
                                    <p className="font-body-lg text-body-lg text-on-surface font-semibold">{label}</p>
                                </div>
                                <span className={`material-symbols-outlined transition-colors ${
                                    answers[current.id] === value ? 'text-primary' : 'text-outline-variant'
                                }`} style={{ fontVariationSettings: answers[current.id] === value ? "'FILL' 1" : "'FILL' 0" }}>
                                    check_circle
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-lg flex justify-between items-center w-full">
                    <button onClick={handlePrev} disabled={step === 0}
                        className="flex items-center gap-xs px-lg py-md rounded-full border border-outline text-on-surface font-label-md hover:bg-surface-container-low transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Sebelumnya
                    </button>
                    {step === questions.length - 1 ? (
                        <button onClick={handleSubmit} disabled={loading || !answers[current.id]}
                            className="flex items-center gap-xs px-xl py-md rounded-full bg-primary text-on-primary font-label-md shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed">
                            {loading ? 'Menghitung...' : 'Lihat Hasil'}
                        </button>
                    ) : (
                        <div />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
