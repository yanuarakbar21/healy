import { Head, Link } from '@inertiajs/react';
import Button from '@/Components/ui/Button';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome to Healy" />
            <div className="min-h-screen bg-surface flex flex-col">
                <header className="px-6 lg:px-[120px] py-6 flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary font-[family-name:var(--font-family-heading)]">Healy</span>
                    <div className="flex gap-3">
                        <Link href="/login">
                            <Button variant="ghost" size="sm">Log In</Button>
                        </Link>
                        <Link href="/register">
                            <Button size="sm">Get Started</Button>
                        </Link>
                    </div>
                </header>
                <main className="flex-1 flex items-center justify-center px-6 lg:px-[120px]">
                    <div className="max-w-2xl text-center">
                        <h1 className="text-4xl lg:text-5xl font-bold text-on-surface font-[family-name:var(--font-family-heading)] leading-tight mb-6">
                            Your Personal<br/>
                            <span className="text-primary">Health Companion</span>
                        </h1>
                        <p className="text-lg text-on-surface-variant font-[family-name:var(--font-family-body)] mb-10 leading-relaxed">
                            Screen your health, track your wellness, and get AI-powered insights — anytime, anywhere.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/register">
                                <Button size="lg">Start Your Health Check</Button>
                            </Link>
                            <Link href="/login">
                                <Button variant="ghost" size="lg">I already have an account</Button>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
