import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';

const stressQuestions = [
    'Merasa kesal karena sesuatu yang terjadi di luar dugaan?',
    'Merasa tidak mampu mengendalikan hal-hal penting dalam hidup Anda?',
    'Merasa gugup dan stres?',
    'Merasa percaya diri dengan kemampuan Anda menghadapi masalah pribadi?',
    'Merasa bahwa semuanya berjalan sesuai keinginan Anda?',
    'Merasa tidak mampu menyelesaikan semua hal yang harus Anda lakukan?',
    'Mampu mengendalikan rasa jengkel dalam hidup Anda?',
    'Merasa berada di puncak kendali atas segala sesuatu?',
    'Merasa marah karena hal-hal di luar kendali Anda?',
    'Merasa kesulitan menumpuk begitu tinggi sehingga Anda tidak mampu mengatasinya?',
];

const scale = [
    ['0', 'Tidak Pernah'],
    ['1', 'Hampir Tidak Pernah'],
    ['2', 'Kadang-kadang'],
    ['3', 'Cukup Sering'],
    ['4', 'Sangat Sering'],
];

export default function Stress() {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [result, setResult] = useState<{ score: number; category: string; recommendation: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const allAnswered = stressQuestions.every((_, i) => answers[`q${i + 1}`] !== undefined);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/assessments/stress', {
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
                <Head title="Tingkat Stres - Healy" />
                <div className="max-w-xl mx-auto">
                    <div className="bg-surface-container-lowest rounded-lg p-6 md:p-10 shadow-[0_30px_60px_-15px_rgba(2,103,131,0.06)] text-center">
                        <div className="w-16 h-16 bg-tertiary-container/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-tertiary text-3xl">psychology</span>
                        </div>
                        <p className="font-label-md text-on-surface-variant">Tingkat Stres Anda (PSS-10)</p>
                        <p className="font-display-lg text-primary my-3">{result.score}<span className="font-headline-md">/40</span></p>
                        <span className={`inline-block px-3 py-1 rounded-full font-label-sm font-bold ${
                            result.category === 'low' ? 'bg-primary/10 text-primary' :
                            result.category === 'moderate' ? 'bg-secondary/10 text-secondary' :
                            'bg-error-container/50 text-error'
                        }`}>{result.category === 'low' ? 'Rendah' : result.category === 'moderate' ? 'Sedang' : 'Tinggi'}</span>
                        <p className="font-body-md text-on-surface mt-4 leading-relaxed">{result.recommendation}</p>
                        <button onClick={() => { setResult(null); setAnswers({}); }}
                            className="mt-6 px-16 py-6 bg-primary text-on-primary rounded-full font-label-md shadow-lg hover:scale-105 active:scale-95 transition-all">
                            Ulangi Tes
                        </button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Tingkat Stres - Healy" />
            <div className="max-w-xl mx-auto space-y-6">
                <h1 className="font-headline-lg text-on-surface">Penilaian Tingkat Stres</h1>
                <p className="font-body-md text-on-surface-variant">Dalam sebulan terakhir, seberapa sering Anda...</p>

                {stressQuestions.map((q, i) => (
                    <div key={i} className="bg-surface-container-lowest rounded-lg p-6 shadow-[0_10px_30px_-5px_rgba(2,103,131,0.06)]">
                        <p className="font-body-md text-on-surface font-semibold mb-4">{i + 1}. {q}</p>
                        <div className="grid grid-cols-5 gap-2">
                            {scale.map(([value, label]) => (
                                <button key={value} onClick={() => setAnswers(prev => ({ ...prev, [`q${i + 1}`]: value }))}
                                    className={`px-2 py-3 rounded-xl font-label-sm text-center transition-colors ${
                                        answers[`q${i + 1}`] === value
                                            ? 'bg-primary text-on-primary'
                                            : 'bg-surface-container text-on-surface-variant hover:bg-primary/10'
                                    }`}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <button disabled={!allAnswered || loading} onClick={handleSubmit}
                    className="w-full py-3 bg-primary text-on-primary rounded-full font-label-md shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                    {loading ? 'Menghitung...' : 'Lihat Hasil'}
                </button>
            </div>
        </AppLayout>
    );
}
