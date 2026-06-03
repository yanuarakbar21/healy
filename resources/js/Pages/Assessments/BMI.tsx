import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/ui/Card';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import Chip from '@/Components/ui/Chip';

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
            setError('Please enter valid height and weight values.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <Head title="BMI Calculator - Healy" />
            <div className="max-w-xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-on-surface font-[family-name:var(--font-family-heading)]">BMI Calculator</h1>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input label="Height (cm)" type="number" step="0.1" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 170" />
                        <Input label="Weight (kg)" type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 65" />
                        {error && <p className="text-sm text-error">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Calculating...' : 'Calculate BMI'}</Button>
                    </form>
                </Card>

                {result && (
                    <Card>
                        <div className="text-center">
                            <p className="text-sm text-on-surface-variant">Your BMI Score</p>
                            <p className="text-5xl font-bold text-primary font-[family-name:var(--font-family-heading)] my-3">{result.score}</p>
                            <Chip variant={result.category === 'normal' ? 'primary' : 'secondary'}>{result.category}</Chip>
                            <p className="text-sm text-on-surface mt-4 leading-relaxed">{result.recommendation}</p>
                        </div>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
