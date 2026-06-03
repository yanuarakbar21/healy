import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/ui/Card';
import AssessmentCard from '@/Components/AssessmentCard';
import type { UserProfile, HealthAssessment } from '@/types';

interface DashboardProps {
    profile: UserProfile;
    latestAssessments: Record<string, HealthAssessment>;
    historyByType: Array<{ type: string; data: Array<{ score: number; category: string; taken_at: string }> }>;
}

export default function Dashboard({ profile, latestAssessments, historyByType }: DashboardProps) {
    const hasProfile = !!(profile?.full_name && profile?.birth_date);
    const hasAssessments = Object.keys(latestAssessments).length > 0;

    return (
        <AppLayout>
            <Head title="Dashboard - Healy" />
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface font-[family-name:var(--font-family-heading)]">
                        Hello, {profile?.full_name?.split(' ')[0] ?? 'there'}
                    </h1>
                    <p className="text-on-surface-variant mt-1">Here's your health overview</p>
                </div>

                {!hasProfile && (
                    <Card className="border-l-4 border-primary bg-primary/5">
                        <p className="text-sm text-on-surface font-[family-name:var(--font-family-body)]">
                            Complete your{' '}
                            <a href="/profile" className="text-primary font-semibold hover:underline">clinical profile</a>
                            {' '}to enable BMI calculation and personalized insights.
                        </p>
                    </Card>
                )}

                {hasAssessments && (
                    <section>
                        <h2 className="text-xl font-semibold text-on-surface font-[family-name:var(--font-family-heading)] mb-4">Latest Results</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.values(latestAssessments).map((a) => (
                                <AssessmentCard key={a.id} assessment={a} />
                            ))}
                        </div>
                    </section>
                )}

                {historyByType.map(({ type, data }) => data.length > 1 && (
                    <section key={type}>
                        <h2 className="text-xl font-semibold text-on-surface font-[family-name:var(--font-family-heading)] mb-4">
                            {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} History
                        </h2>
                        <Card>
                            <div className="space-y-3">
                                {data.slice().reverse().map((entry, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-outline-variant/20 last:border-0">
                                        <span className="text-sm text-on-surface-variant">{new Date(entry.taken_at).toLocaleDateString()}</span>
                                        <span className="font-semibold text-on-surface">{entry.score} — {entry.category}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </section>
                ))}

                {!hasAssessments && (
                    <Card className="text-center py-12">
                        <p className="text-on-surface-variant mb-4">No health assessments yet</p>
                        <a href="/assessments" className="inline-flex items-center px-6 py-3 rounded-full bg-primary text-on-primary font-semibold hover:bg-primary/90 transition-colors">
                            Take Your First Test
                        </a>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
