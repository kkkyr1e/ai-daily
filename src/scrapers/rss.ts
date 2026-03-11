// src/scrapers/rss.ts
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000,
});

export interface RssItem {
  title: string;
  link: string;
  summary: string;
  source: string;
  pubDate: Date;
}

async function fetchSingleFeed(url: string): Promise<RssItem[]> {
  try {
    const feed = await parser.parseURL(url);
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return feed.items
      .filter((item) => {
        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date(0);
        return pubDate >= oneDayAgo;
      })
      .map((item) => ({
        title: item.title || "Untitled",
        link: item.link || "",
        summary: (item.contentSnippet || "").slice(0, 500),
        source: feed.title || url,
        pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      }));
  } catch (error) {
    console.warn(`[WARN] Failed to fetch ${url}: ${error}`);
    return [];
  }
}

export async function fetchAllRssFeeds(urls: string[]): Promise<RssItem[]> {
  const results = await Promise.all(urls.map(fetchSingleFeed));
  return results.flat();
}