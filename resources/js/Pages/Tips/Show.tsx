import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

interface Article {
    id: string;
    title: string;
    title_id: string | null;
    slug: string;
    description: string;
    description_id: string | null;
    image_url: string | null;
    source: string;
    source_url: string;
    category: string;
    published_at: string;
}

interface RelatedArticle {
    id: string;
    title: string;
    title_id: string | null;
    slug: string;
    image_url: string | null;
    source: string;
    category: string;
    published_at: string;
}

interface Props {
    article: Article;
    relatedArticles: RelatedArticle[];
    isBookmarked: boolean;
}

const categoryGradients: Record<string, string> = {
    disease: 'from-red-500/20 to-rose-500/10',
    nutrition: 'from-green-600/20 to-emerald-500/10',
    mental: 'from-violet-500/20 to-purple-500/10',
    exercise: 'from-orange-500/20 to-amber-500/10',
    general: 'from-teal-500/20 to-cyan-500/10',
};

const categoryIcons: Record<string, string> = {
    disease: 'coronavirus',
    nutrition: 'nutrition',
    mental: 'psychology',
    exercise: 'exercise',
    general: 'info',
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'baru saja';
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} hari lalu`;
    return new Date(dateStr).toLocaleDateString('id-ID');
}

export default function TipsShow({ article, relatedArticles, isBookmarked }: Props) {
    const grad = categoryGradients[article.category] ?? categoryGradients.general;
    const icon = categoryIcons[article.category] ?? categoryIcons.general;

    return (
        <AppLayout>
            <Head title={`${article.title} - Healy`} />
            <div className="max-w-4xl mx-auto space-y-8">
                <Link href="/dashboard"
                    className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Kembali ke Beranda
                </Link>

                <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_10px_30px_-5px_rgba(2,103,131,0.06)]">
                    <div className={`h-56 md:h-72 bg-gradient-to-br ${grad} flex items-center justify-center relative overflow-hidden`}>
                        {article.image_url ? (
                            <img src={article.image_url} alt={article.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="material-symbols-outlined text-[80px] md:text-[100px] text-on-surface/20">{icon}</span>
                        )}
                    </div>

                    <div className="p-6 md:p-10 space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="px-3 py-1 rounded-full text-[12px] font-label-sm bg-primary/10 text-primary">
                                {article.category === 'general' ? 'Info Kesehatan' : article.category}
                            </span>
                            <span className="flex items-center gap-1 text-on-surface-variant/60 font-label-sm">
                                <span className="material-symbols-outlined text-[16px]">schedule</span>
                                {timeAgo(article.published_at)}
                            </span>
                            <span className="flex items-center gap-1 text-on-surface-variant/60 font-label-sm">
                                <span className="material-symbols-outlined text-[16px]">source</span>
                                {article.source}
                            </span>
                        </div>

                        <h1 className="font-headline-lg text-[24px] md:text-[32px] text-on-surface leading-tight">
                            {article.title_id ?? article.title}
                        </h1>

                        <p className="font-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">
                            {article.description_id ?? article.description}
                        </p>

                        <div className="pt-4 border-t border-outline-variant/20">
                            <a href={article.source_url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-label-md hover:bg-primary/90 transition-all active:scale-95 shadow-md">
                                <span>Baca artikel asli di {article.source}</span>
                                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                            </a>
                        </div>
                    </div>
                </div>

                {relatedArticles.length > 0 && (
                    <section className="space-y-5">
                        <h2 className="font-headline-md text-on-surface">Artikel Terkait</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {relatedArticles.map((rel) => {
                                const g = categoryGradients[rel.category] ?? categoryGradients.general;
                                const ic = categoryIcons[rel.category] ?? categoryIcons.general;
                                return (
                                    <Link key={rel.id} href={`/tips/${rel.slug}`}
                                        className="flex gap-4 bg-surface-container-lowest rounded-xl p-4 hover:shadow-md transition-all group">
                                        <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${g} flex-shrink-0 flex items-center justify-center overflow-hidden`}>
                                            {rel.image_url ? (
                                                <img src={rel.image_url} alt={rel.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="material-symbols-outlined text-[28px] text-on-surface/20">{ic}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-[11px] font-label-sm text-primary">{rel.source}</span>
                                            <h4 className="font-headline-sm text-[14px] text-on-surface line-clamp-2 group-hover:text-primary transition-colors">
                                                {rel.title_id ?? rel.title}
                                            </h4>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>
        </AppLayout>
    );
}
