import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/ui/Card';

interface AdminProps {
    totalUsers: number;
    totalAssessments: number;
    assessmentsByType: Record<string, number>;
}

export default function AdminDashboard({ totalUsers, totalAssessments, assessmentsByType }: AdminProps) {
    return (
        <AppLayout>
            <Head title="Admin - Healy" />
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-on-surface font-[family-name:var(--font-family-heading)]">Admin Dashboard</h1>
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <p className="text-sm text-on-surface-variant">Total Users</p>
                        <p className="text-3xl font-bold text-primary font-[family-name:var(--font-family-heading)]">{totalUsers}</p>
                    </Card>
                    <Card>
                        <p className="text-sm text-on-surface-variant">Total Assessments</p>
                        <p className="text-3xl font-bold text-secondary font-[family-name:var(--font-family-heading)]">{totalAssessments}</p>
                    </Card>
                </div>
                <Card>
                    <h2 className="text-lg font-semibold mb-4 font-[family-name:var(--font-family-heading)]">Assessments by Type</h2>
                    <div className="space-y-3">
                        {Object.entries(assessmentsByType).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between py-2 border-b border-outline-variant/20 last:border-0">
                                <span className="capitalize text-sm">{type.replace('_', ' ')}</span>
                                <span className="font-semibold">{count}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
