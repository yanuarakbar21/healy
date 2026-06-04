<?php

namespace App\Console\Commands;

use App\Services\NewsFeedService;
use Illuminate\Console\Command;

class FetchOgImages extends Command
{
    protected $signature = 'news:fetch-og-images';
    protected $description = 'Fetch OG images for articles with missing images';

    public function handle(NewsFeedService $service): int
    {
        $this->info('Fetching missing OG images...');
        $service->fetchMissingOgImages();
        $this->info('Done!');
        return Command::SUCCESS;
    }
}
