import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';

interface BMIProps {
    profileHeight: number | null;
    profileWeight: number | null;
}

export default function BMI({ profileHeight, profileWeight }: BMIProps) {
    const [height, setHeight] = useState(profileHeight?.toString() ?? '');
    const [weight, setWeight] = useState(profileWeight?.toString() ?? '');
    const [result, setResult] = useState<{ score: number; category: string; recommendation: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/assessments/bmi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('supabase_token')}` },
                body: JSON.stringify({ height_cm: height, weight_kg: weight }),
            });
            if (!res.ok) throw new Error('Invalid input');
            const data = await res.json();
            setResult(data);
        } catch {
            setError('Masukkan tinggi dan berat badan yang valid.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <Head title="Kalkulator BMI - Healy" />
            <div className="max-w-xl mx-auto space-y-6">
                <h1 className="font-headline-lg text-on-surface">Kalkulator BMI</h1>

                <div className="bg-surface-container-lowest rounded-lg p-6 md:p-10 shadow-[0_30px_60px_-15px_rgba(2,103,131,0.06)]">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="font-label-md text-on-surface mb-1 block">Tinggi Badan (cm)</label>
                            <input type="number" step="0.1" value={height} onChange={e => setHeight(e.target.value)}
                                placeholder="cth. 170"
                                className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                        </div>
                        <div>
                            <label className="font-label-md text-on-surface mb-1 block">Berat Badan (kg)</label>
                            <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)}
                                placeholder="cth. 65"
                                className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                        </div>
                        {error && <p className="text-sm text-error font-label-sm">{error}</p>}
                        <button type="submit" disabled={loading}
                            className="w-full py-3 bg-primary text-on-primary rounded-full font-label-md shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                            {loading ? 'Menghitung...' : 'Hitung BMI'}
                        </button>
                    </form>
                </div>

                {result && (
                    <div className="bg-surface-container-lowest rounded-lg p-6 md:p-10 shadow-[0_30px_60px_-15px_rgba(2,103,131,0.06)] text-center">
                        <p className="font-label-md text-on-surface-variant">Skor BMI Anda</p>
                        <p className="font-display-lg text-primary my-3">{result.score}</p>
                        <span className={`inline-block px-3 py-1 rounded-full font-label-sm font-bold ${
                            result.category === 'normal' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                        }`}>{result.category}</span>
                        <p className="font-body-md text-on-surface mt-4 leading-relaxed">{result.recommendation}</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
