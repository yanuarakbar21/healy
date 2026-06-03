import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Chip from '@/Components/ui/Chip';

const stressQuestions = [
    'Been upset because of something that happened unexpectedly?',
    'Felt unable to control the important things in your life?',
    'Felt nervous and stressed?',
    'Felt confident about your ability to handle personal problems?',
    'Felt that things were going your way?',
    'Found that you could not cope with all the things you had to do?',
    'Been able to control irritations in your life?',
    'Felt that you were on top of things?',
    'Been angered because of things outside your control?',
    'Felt difficulties were piling up so high you could not overcome them?',
];

const scale = [
    ['0', 'Never'],
    ['1', 'Almost Never'],
    ['2', 'Sometimes'],
    ['3', 'Fairly Often'],
    ['4', 'Very Often'],
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
        } catch { /* ignore */ } finally {
            setLoading(false);
        }
    };

    if (result) {
        return (
            <AppLayout>
                <Head title="Stress Level - Healy" />
                <div className="max-w-xl mx-auto">
                    <Card>
                        <div className="text-center">
                            <p className="text-sm text-on-surface-variant">Your Stress Level (PSS-10)</p>
                            <p className="text-5xl font-bold text-primary font-[family-name:var(--font-family-heading)] my-3">{result.score}/40</p>
                            <Chip variant={result.category === 'low' ? 'primary' : result.category === 'moderate' ? 'secondary' : 'tertiary'}>{result.category} stress</Chip>
                            <p className="text-sm text-on-surface mt-4 leading-relaxed">{result.recommendation}</p>
                            <Button className="mt-6" onClick={() => { setResult(null); setAnswers({}); }}>Retake Test</Button>
                        </div>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Stress Level - Healy" />
            <div className="max-w-xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-on-surface font-[family-name:var(--font-family-heading)]">Stress Level Assessment</h1>
                <p className="text-sm text-on-surface-variant">In the last month, how often have you...</p>

                {stressQuestions.map((q, i) => (
                    <Card key={i}>
                        <p className="text-sm font-semibold text-on-surface mb-4">{i + 1}. {q}</p>
                        <div className="grid grid-cols-5 gap-2">
                            {scale.map(([value, label]) => (
                                <button
                                    key={value}
                                    onClick={() => setAnswers(prev => ({ ...prev, [`q${i + 1}`]: value }))}
                                    className={`px-2 py-3 rounded-xl text-xs text-center font-semibold transition-colors
                                        ${answers[`q${i + 1}`] === value
                                            ? 'bg-primary text-on-primary'
                                            : 'bg-surface-container text-on-surface-variant hover:bg-primary/10'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </Card>
                ))}

                <Button className="w-full" disabled={!allAnswered || loading} onClick={handleSubmit}>
                    {loading ? 'Calculating...' : 'See Results'}
                </Button>
            </div>
        </AppLayout>
    );
}
