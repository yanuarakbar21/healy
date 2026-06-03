import { Head, useForm } from '@inertiajs/react';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Card from '@/Components/ui/Card';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        full_name: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/api/auth/register');
    };

    return (
        <>
            <Head title="Sign Up - Healy" />
            <div className="min-h-screen bg-surface flex items-center justify-center px-5">
                <Card className="w-full max-w-md">
                    <h1 className="text-2xl font-bold text-on-surface font-[family-name:var(--font-family-heading)] mb-2">Create Account</h1>
                    <p className="text-sm text-on-surface-variant mb-8 font-[family-name:var(--font-family-body)]">Start your health journey with Healy</p>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input label="Full Name" value={data.full_name} onChange={e => setData('full_name', e.target.value)} error={errors.full_name} placeholder="John Doe" />
                        <Input label="Email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} error={errors.email} placeholder="your@email.com" />
                        <Input label="Password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} error={errors.password} placeholder="••••••••" />
                        <Button type="submit" className="w-full" disabled={processing}>Create Account</Button>
                    </form>
                    <p className="text-center text-sm text-on-surface-variant mt-6 font-[family-name:var(--font-family-body)]">
                        Already have an account?{' '}
                        <a href="/login" className="text-primary font-semibold hover:underline">Log In</a>
                    </p>
                </Card>
            </div>
        </>
    );
}
