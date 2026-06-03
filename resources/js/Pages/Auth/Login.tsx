import { Head, useForm } from '@inertiajs/react';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Card from '@/Components/ui/Card';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/api/auth/login');
    };

    return (
        <>
            <Head title="Log In - Healy" />
            <div className="min-h-screen bg-surface flex items-center justify-center px-5">
                <Card className="w-full max-w-md">
                    <h1 className="text-2xl font-bold text-on-surface font-[family-name:var(--font-family-heading)] mb-2">Welcome Back</h1>
                    <p className="text-sm text-on-surface-variant mb-8 font-[family-name:var(--font-family-body)]">Log in to your Healy account</p>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input label="Email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} error={errors.email} placeholder="your@email.com" />
                        <Input label="Password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} error={errors.password} placeholder="••••••••" />
                        <Button type="submit" className="w-full" disabled={processing}>Log In</Button>
                    </form>
                    <p className="text-center text-sm text-on-surface-variant mt-6 font-[family-name:var(--font-family-body)]">
                        Don't have an account?{' '}
                        <a href="/register" className="text-primary font-semibold hover:underline">Sign Up</a>
                    </p>
                </Card>
            </div>
        </>
    );
}
