import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const tests = [
    { href: '/assessments/bmi', title: 'Kalkulator BMI', desc: 'Hitung Indeks Massa Tubuh dan dapatkan rekomendasi nutrisi yang sesuai', icon: 'monitor_weight', time: '1 menit' },
    { href: '/assessments/diabetes', title: 'Skrining Risiko Diabetes', desc: 'Nilailah risiko Diabetes Tipe-2 Anda berdasarkan gaya hidup dan faktor genetik', icon: 'bloodtype', time: '3 menit' },
    { href: '/assessments/stress', title: 'Tingkat Stres', desc: 'Ukur tingkat stres Anda menggunakan skala PSS-10 yang telah terverifikasi secara klinis', icon: 'psychology', time: '5 menit' },
];

export default function Index() {
    return (
        <AppLayout>
            <Head title="Skrining Kesehatan - Healy" />
            <div className="space-y-6">
                <div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface">Skrining Kesehatan</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">Pilih tes untuk memeriksa kondisi kesehatan Anda</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tests.map((test) => (
                        <Link key={test.href} href={test.href}>
                            <div className="bg-surface-container-lowest rounded-lg p-lg shadow-[0_10px_30px_-5px_rgba(2,103,131,0.06)] h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer flex flex-col">
                                <div className="w-12 h-12 bg-primary-container/20 rounded-full flex items-center justify-center mb-md">
                                    <span className="material-symbols-outlined text-primary">{test.icon}</span>
                                </div>
                                <h3 className="font-headline-md text-[18px] text-on-surface mb-sm">{test.title}</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant flex-1">{test.desc}</p>
                                <span className="inline-block mt-4 font-label-sm text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">{test.time}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
