<?php

namespace App\Http\Controllers;

use App\Models\ArticleBookmark;
use App\Models\ArticleRead;
use App\Models\HealthArticle;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        $query = HealthArticle::orderBy('published_at', 'desc');

        if ($category = $request->get('category')) {
            $query->byCategory($category);
        }

        if ($search = $request->get('search')) {
            $query->search($search);
        }

        $articles = $query->paginate(config('news.pagination', 12));

        $userId = auth()->id();
        $bookmarkedIds = ArticleBookmark::where('user_id', $userId)
            ->pluck('article_id')->toArray();
        $readIds = ArticleRead::where('user_id', $userId)
            ->pluck('article_id')->toArray();

        $categories = HealthArticle::select('category')
            ->selectRaw('count(*) as count')
            ->groupBy('category')
            ->orderByDesc('count')
            ->pluck('count', 'category');

        return inertia('News/Index', [
            'articles' => $articles,
            'bookmarkedIds' => $bookmarkedIds,
            'readIds' => $readIds,
            'categories' => $categories,
            'filters' => $request->only(['category', 'search']),
        ]);
    }

    public function show(string $slug)
    {
        $article = HealthArticle::where('slug', $slug)->firstOrFail();

        $userId = auth()->id();
        ArticleRead::firstOrCreate([
            'user_id' => $userId,
            'article_id' => $article->id,
        ], ['read_at' => now()]);

        $isBookmarked = ArticleBookmark::where('user_id', $userId)
            ->where('article_id', $article->id)->exists();

        $related = HealthArticle::byCategory($article->category)
            ->where('id', '!=', $article->id)
            ->orderBy('published_at', 'desc')
            ->take(4)
            ->get();

        return inertia('Tips/Show', [
            'article' => $article,
            'relatedArticles' => $related,
            'isBookmarked' => $isBookmarked,
        ]);
    }

    public function bookmarks()
    {
        $userId = auth()->id();
        $articleIds = ArticleBookmark::where('user_id', $userId)
            ->pluck('article_id');

        $articles = HealthArticle::whereIn('id', $articleIds)
            ->orderBy('published_at', 'desc')
            ->paginate(config('news.pagination', 12));

        return inertia('News/Bookmarks', [
            'articles' => $articles,
        ]);
    }

    public function toggleBookmark(Request $request)
    {
        $data = $request->validate(['article_id' => 'required|uuid|exists:health_articles,id']);
        $userId = auth()->id();

        $existing = ArticleBookmark::where('user_id', $userId)
            ->where('article_id', $data['article_id'])->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['bookmarked' => false]);
        }

        ArticleBookmark::create([
            'id' => Str::uuid(),
            'user_id' => $userId,
            'article_id' => $data['article_id'],
        ]);

        return response()->json(['bookmarked' => true]);
    }

    public function latest()
    {
        $articles = HealthArticle::orderBy('published_at', 'desc')
            ->take(5)
            ->get(['id', 'title', 'category', 'source', 'slug', 'published_at']);

        return response()->json($articles);
    }

    public function markRead(Request $request)
    {
        $data = $request->validate(['article_id' => 'required|uuid|exists:health_articles,id']);
        $userId = auth()->id();

        ArticleRead::firstOrCreate([
            'user_id' => $userId,
            'article_id' => $data['article_id'],
        ], ['read_at' => now()]);

        return response()->json(['ok' => true]);
    }
}
