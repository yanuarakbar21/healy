import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/ui/Card';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import type { UserProfile } from '@/types';

interface ProfileProps {
    profile: UserProfile;
}

export default function Complete({ profile }: ProfileProps) {
    const { data, setData, put, processing, errors } = useForm({
        full_name: profile?.full_name ?? '',
        birth_date: profile?.birth_date ?? '',
        gender: profile?.gender ?? 'male',
        height_cm: profile?.height_cm?.toString() ?? '',
        weight_kg: profile?.weight_kg?.toString() ?? '',
        allergies: profile?.allergies ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/api/profile');
    };

    return (
        <AppLayout>
            <Head title="Profile - Healy" />
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-on-surface font-[family-name:var(--font-family-heading)] mb-6">Clinical Profile</h1>
                <form onSubmit={handleSubmit}>
                    <Card className="space-y-5">
                        <Input label="Full Name" value={data.full_name} onChange={e => setData('full_name', e.target.value)} error={errors.full_name} />
                        
                        <Input label="Date of Birth" type="date" value={data.birth_date} onChange={e => setData('birth_date', e.target.value)} error={errors.birth_date} />

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-on-surface">Gender</label>
                            <div className="flex gap-4">
                                {['male', 'female', 'other'].map(g => (
                                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="gender" value={g} checked={data.gender === g} onChange={e => setData('gender', e.target.value)} className="accent-primary" />
                                        <span className="text-sm capitalize">{g}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.gender && <span className="text-xs text-error">{errors.gender}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Height (cm)" type="number" step="0.1" value={data.height_cm} onChange={e => setData('height_cm', e.target.value)} error={errors.height_cm} />
                            <Input label="Weight (kg)" type="number" step="0.1" value={data.weight_kg} onChange={e => setData('weight_kg', e.target.value)} error={errors.weight_kg} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-on-surface">Allergies</label>
                            <textarea
                                value={data.allergies}
                                onChange={e => setData('allergies', e.target.value)}
                                className="rounded-2xl border border-outline bg-surface px-5 py-2.5 text-base text-on-surface resize-none h-24 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                            {errors.allergies && <span className="text-xs text-error">{errors.allergies}</span>}
                        </div>

                        <Button type="submit" className="w-full" disabled={processing}>Save Profile</Button>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
