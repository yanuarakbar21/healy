import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/ui/Card';

const tests = [
    { href: '/assessments/bmi', title: 'BMI Calculator', desc: 'Calculate your Body Mass Index and get nutrition recommendations', icon: '⚖️', time: '1 min' },
    { href: '/assessments/diabetes', title: 'Diabetes Risk Screening', desc: 'Assess your risk for Type-2 Diabetes based on lifestyle and genetics', icon: '🩸', time: '3 min' },
    { href: '/assessments/stress', title: 'Stress Level Assessment', desc: 'Measure your stress levels using the clinically validated PSS-10 scale', icon: '🧠', time: '5 min' },
];

export default function Index() {
    return (
        <AppLayout>
            <Head title="Health Tests - Healy" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface font-[family-name:var(--font-family-heading)]">Health Assessments</h1>
                    <p className="text-on-surface-variant mt-1">Choose a test to check your health status</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tests.map((test) => (
                        <Link key={test.href} href={test.href}>
                            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                <span className="text-3xl">{test.icon}</span>
                                <h3 className="text-lg font-semibold mt-3 font-[family-name:var(--font-family-heading)]">{test.title}</h3>
                                <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">{test.desc}</p>
                                <span className="inline-block mt-4 text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">{test.time}</span>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
