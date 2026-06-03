import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Welcome() {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('active');
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <>
            <Head title="Healy - Asisten Kesehatan Pintar" />
            <div className="min-h-screen bg-surface flex flex-col overflow-x-hidden">
                <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-50">
                    <nav className="flex justify-between items-center w-full px-5 md:px-[120px] py-2 max-w-7xl mx-auto">
                        <div className="font-headline-md font-bold text-primary">Healy</div>
                        <div className="flex items-center gap-3">
                            <Link href="/login" className="px-6 py-2.5 border-2 border-outline text-primary rounded-full font-label-md hover:bg-surface-container-low transition-colors">
                                Masuk
                            </Link>
                            <Link href="/register" className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-label-md shadow-lg hover:scale-105 active:scale-95 transition-transform">
                                Daftar
                            </Link>
                        </div>
                    </nav>
                </header>

                <main>
                    <section className="relative overflow-hidden pt-16 pb-16 md:pt-[100px] md:pb-[140px] px-5 md:px-[120px]">
                        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-16">
                            <div className="order-2 md:order-1 reveal">
                                <span className="inline-block px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full font-label-md mb-6">
                                    Pilihan Keluarga Sehat
                                </span>
                                <h1 className="font-display-lg text-[42px] leading-tight md:text-[48px] text-on-surface mb-6">
                                    Asisten Kesehatan Pintar untuk <span className="text-primary">Keluarga Anda</span>
                                </h1>
                                <p className="font-body-lg text-on-surface-variant mb-16 max-w-lg">
                                    Pantau kesehatan orang tercinta dengan teknologi AI yang presisi. Konsultasi 24/7 dan penilaian kesehatan mandiri dalam satu genggaman.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <Link href="/register" className="px-16 py-6 bg-primary text-on-primary rounded-full font-label-md shadow-lg hover:scale-105 active:scale-95 transition-transform text-center">
                                        Mulai Tes Kesehatan
                                    </Link>
                                    <Link href="/login" className="px-16 py-6 border-2 border-outline text-primary rounded-full font-label-md hover:bg-surface-container-low transition-colors text-center">
                                        Pelajari Lebih Lanjut
                                    </Link>
                                </div>
                            </div>
                            <div className="order-1 md:order-2 flex justify-center items-center relative reveal">
                                <div className="absolute -z-10 w-[300px] h-[300px] bg-primary-container/20 blur-3xl rounded-full top-0 left-0" />
                                <div className="absolute -z-10 w-[200px] h-[200px] bg-secondary-container/30 blur-3xl rounded-full bottom-0 right-0" />
                                <div className="animate-float">
                                    <div className="w-full max-w-[500px] aspect-[4/3] bg-gradient-to-br from-primary-container/30 to-secondary-container/30 rounded-xl shadow-2xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[120px] text-primary/40">health_and_safety</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-10 -left-6 glass-card p-6 rounded-lg shadow-xl hidden md:block">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                        </div>
                                        <div>
                                            <div className="font-label-sm text-on-surface-variant">Detak Jantung</div>
                                            <div className="font-headline-md text-on-surface">72 BPM</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="py-16 bg-surface-container-low px-5 md:px-[120px]">
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-16 reveal">
                                <h2 className="font-headline-lg text-on-surface mb-3">Fitur Unggulan Kami</h2>
                                <p className="font-body-md text-on-surface-variant">Teknologi kesehatan tercanggih yang dirancang khusus untuk kemudahan akses keluarga.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div className="md:col-span-8 bg-surface-container-lowest p-10 rounded-lg shadow-[0_10px_30px_-5px_rgba(2,103,131,0.06)] border border-outline-variant/30 flex flex-col md:flex-row gap-10 items-center reveal">
                                    <div className="flex-1">
                                        <div className="w-12 h-12 bg-primary-fixed-dim text-on-primary-fixed-variant rounded-full flex items-center justify-center mb-6">
                                            <span className="material-symbols-outlined">smart_toy</span>
                                        </div>
                                        <h3 className="font-headline-md text-on-surface mb-3">Healy AI Consultant</h3>
                                        <p className="text-on-surface-variant mb-6">Obrolan cerdas 24/7 untuk menjawab pertanyaan kesehatan harian Anda. Berbasis data medis terkini untuk memberikan panduan yang aman.</p>
                                        <ul className="space-y-3 mb-10">
                                            <li className="flex items-center gap-3 font-label-md">
                                                <span className="material-symbols-outlined text-primary">check_circle</span> Respon Instan & Akurat
                                            </li>
                                            <li className="flex items-center gap-3 font-label-md">
                                                <span className="material-symbols-outlined text-primary">check_circle</span> Privasi Data Terjamin
                                            </li>
                                        </ul>
                                        <Link href="/chat" className="text-primary font-bold hover:underline flex items-center gap-2">
                                            Mulai Konsultasi <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                        </Link>
                                    </div>
                                    <div className="flex-1 w-full h-full min-h-[250px] relative rounded-lg overflow-hidden bg-gradient-to-br from-primary-container/20 to-secondary-container/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[80px] text-primary/30">neurology</span>
                                    </div>
                                </div>
                                <div className="md:col-span-4 bg-primary text-on-primary p-10 rounded-lg shadow-lg flex flex-col justify-between reveal">
                                    <div>
                                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-6">
                                            <span className="material-symbols-outlined text-white">health_metrics</span>
                                        </div>
                                        <h3 className="font-headline-md mb-3">Health Assessments</h3>
                                        <p className="text-on-primary/80 mb-16">Lakukan screening kesehatan berkala secara mandiri dengan algoritma terverifikasi medis.</p>
                                    </div>
                                    <Link href="/register" className="w-full py-6 bg-white text-primary rounded-full font-label-md hover:bg-surface-container-low transition-colors text-center">
                                        Cek Sekarang
                                    </Link>
                                </div>
                                <div className="md:col-span-6 bg-secondary-container text-on-secondary-container p-10 rounded-lg flex flex-col md:flex-row items-center gap-6 reveal">
                                    <div className="flex-1">
                                        <h3 className="font-headline-md mb-3">Dashboard Keluarga</h3>
                                        <p className="text-on-secondary-container/80 font-body-md">Satu tempat untuk memantau rekam medis seluruh anggota keluarga secara aman dan terorganisir.</p>
                                    </div>
                                    <div className="flex-1 flex -space-x-4">
                                        <div className="w-14 h-14 rounded-full border-4 border-white bg-primary-container/30 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary">person</span>
                                        </div>
                                        <div className="w-14 h-14 rounded-full border-4 border-white bg-secondary-container/50 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-secondary">person</span>
                                        </div>
                                        <div className="w-14 h-14 rounded-full border-4 border-white bg-tertiary-container/30 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-tertiary">person</span>
                                        </div>
                                        <div className="w-14 h-14 rounded-full border-4 border-white bg-secondary text-on-secondary flex items-center justify-center font-bold text-lg">+</div>
                                    </div>
                                </div>
                                <div className="md:col-span-6 bg-tertiary-container text-on-tertiary-container p-10 rounded-lg flex flex-col justify-center reveal">
                                    <div className="flex items-center gap-6">
                                        <div className="flex-1">
                                            <h3 className="font-headline-md mb-3">Tips Harian</h3>
                                            <p className="text-on-tertiary-container/80">Dapatkan artikel dan tips kesehatan yang dipersonalisasi sesuai kebutuhan nutrisi dan gaya hidup Anda.</p>
                                        </div>
                                        <span className="material-symbols-outlined text-[64px] opacity-30">self_improvement</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="py-16 px-5 md:px-[120px] bg-surface overflow-hidden">
                        <div className="max-w-7xl mx-auto reveal">
                            <div className="relative bg-primary-fixed-dim rounded-xl p-10 md:p-16 flex flex-col items-center text-center">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl" />
                                <h2 className="font-headline-lg text-on-primary-fixed mb-6 max-w-2xl">Siap Memulai Perjalanan Hidup Sehat Bersama Healy?</h2>
                                <p className="font-body-lg text-on-primary-fixed-variant mb-16 max-w-xl">Bergabunglah dengan ribuan keluarga lainnya yang telah mempercayakan asisten kesehatan mereka pada AI cerdas kami.</p>
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <Link href="/register" className="px-16 py-6 bg-primary text-on-primary rounded-full font-label-md shadow-lg">
                                        Daftar Sekarang
                                    </Link>
                                    <Link href="/login" className="px-16 py-6 bg-white/50 text-primary rounded-full font-label-md backdrop-blur-sm">
                                        Masuk
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="bg-surface-container-low">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full px-5 md:px-[120px] py-10 space-y-6 md:space-y-0 max-w-7xl mx-auto">
                        <div className="flex flex-col gap-3">
                            <div className="font-headline-md text-primary">Healy</div>
                            <p className="font-label-sm text-on-surface-variant max-w-xs">© 2024 Healy Digital Health. All rights reserved.</p>
                        </div>
                        <div className="flex flex-wrap gap-6">
                            <a className="text-on-surface-variant hover:text-secondary transition-colors font-label-sm" href="#">Kebijakan Privasi</a>
                            <a className="text-on-surface-variant hover:text-secondary transition-colors font-label-sm" href="#">Ketentuan Layanan</a>
                            <a className="text-on-surface-variant hover:text-secondary transition-colors font-label-sm" href="#">Hubungi Kami</a>
                        </div>
                        <div className="max-w-[300px]">
                            <p className="font-label-sm text-on-surface-variant italic">Medical Disclaimer: Healy is for informational purposes only and does not provide medical advice, diagnosis, or treatment.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
