<?php

namespace App\Console\Commands;

use App\Services\NewsFeedService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('news:refresh')]
#[Description('Fetch and refresh health news articles from RSS feeds')]
class RefreshNews extends Command
{
    public function handle(NewsFeedService $service): void
    {
        $this->info('Refreshing news from RSS feeds...');

        $count = $service->refresh();

        $this->info("Done! {$count} articles imported/updated.");
    }
}
