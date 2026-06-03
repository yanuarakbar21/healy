import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Chip from '@/Components/ui/Chip';

const questions = [
    { id: 'age_group', text: 'What is your age group?', options: [['1', 'Under 25'], ['2', '25-34'], ['3', '35-44'], ['4', '45-54'], ['5', '55 or older']] },
    { id: 'family_history', text: 'Do you have a family history of diabetes?', options: [['no', 'No'], ['yes', 'Yes']] },
    { id: 'activity', text: 'How would you describe your physical activity level?', options: [['1', 'Active (regular exercise)'], ['2', 'Moderate (occasional)'], ['3', 'Sedentary (rarely)']] },
    { id: 'diet', text: 'How would you describe your diet?', options: [['1', 'Balanced with plenty of vegetables'], ['2', 'Moderate'], ['3', 'High in sugar/processed foods']] },
    { id: 'waist', text: 'How would you describe your waist circumference?', options: [['1', 'Healthy range'], ['2', 'Slightly elevated'], ['3', 'Significantly elevated']] },
    { id: 'hypertension', text: 'Do you have high blood pressure?', options: [['no', 'No'], ['yes', 'Yes']] },
    { id: 'high_blood_sugar', text: 'Have you ever been told you have high blood sugar?', options: [['no', 'No'], ['yes', 'Yes']] },
];

export default function Diabetes() {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [step, setStep] = useState(0);
    const [result, setResult] = useState<{ score: number; category: string; recommendation: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const current = questions[step];

    const handleAnswer = (value: string) => {
        setAnswers(prev => ({ ...prev, [current.id]: value }));
        if (step < questions.length - 1) {
            setStep(step + 1);
        }
    };

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
        } catch { /* ignore */ } finally {
            setLoading(false);
        }
    };

    if (result) {
        return (
            <AppLayout>
                <Head title="Diabetes Risk - Healy" />
                <div className="max-w-xl mx-auto">
                    <Card>
                        <div className="text-center">
                            <p className="text-sm text-on-surface-variant">Your Diabetes Risk Score</p>
                            <p className="text-5xl font-bold text-primary font-[family-name:var(--font-family-heading)] my-3">{result.score}</p>
                            <Chip variant={result.category === 'low' ? 'primary' : result.category === 'moderate' ? 'secondary' : 'tertiary'}>{result.category} risk</Chip>
                            <p className="text-sm text-on-surface mt-4 leading-relaxed">{result.recommendation}</p>
                            <Button className="mt-6" onClick={() => { setResult(null); setStep(0); setAnswers({}); }}>Retake Test</Button>
                        </div>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Diabetes Risk - Healy" />
            <div className="max-w-xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-on-surface font-[family-name:var(--font-family-heading)]">Diabetes Risk Screening</h1>
                    <span className="text-sm text-on-surface-variant">Question {step + 1} of {questions.length}</span>
                </div>
                <Card>
                    <p className="text-base font-semibold text-on-surface mb-6">{current.text}</p>
                    <div className="space-y-3">
                        {current.options.map(([value, label]) => (
                            <button
                                key={value}
                                onClick={() => handleAnswer(value)}
                                className="w-full text-left px-5 py-4 rounded-2xl border border-outline-variant hover:border-primary hover:bg-primary/5 transition-colors text-sm font-[family-name:var(--font-family-body)]"
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    {step === questions.length - 1 && (
                        <Button className="w-full mt-6" onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Calculating...' : 'See Results'}
                        </Button>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
