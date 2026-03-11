// src/scrapers/arxiv.ts
import Parser from "rss-parser";
import { ARXIV_CONFIG } from "../../config";

const parser = new Parser({ timeout: 10000 });

export interface ArxivPaper {
  title: string;
  link: string;
  summary: string;
  authors: string[];
  pubDate: Date;
}

async function fetchArxivFeed(url: string): Promise<ArxivPaper[]> {
  try {
    const feed = await parser.parseURL(url);
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return feed.items
      .filter((item) => {
        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date(0);
        return pubDate >= oneDayAgo;
      })
      .slice(0, ARXIV_CONFIG.maxPapersPerFeed)
      .map((item) => ({
        title: item.title?.replace(/\s+/g, " ").trim() || "Untitled",
        link: item.link || "",
        summary: (item.contentSnippet || "").slice(0, ARXIV_CONFIG.maxSummaryLength),
        authors: item.creator ? [item.creator] : [],
        pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      }));
  } catch (error) {
    console.warn(`[WARN] Failed to fetch arXiv ${url}: ${error}`);
    return [];
  }
}

export async function fetchAllArxivPapers(urls: string[]): Promise<ArxivPaper[]> {
  const results = await Promise.all(urls.map(fetchArxivFeed));
  const allPapers = results.flat();

  // 去重（按标题）
  const seen = new Set<string>();
  const deduped = allPapers.filter((paper) => {
    const normalizedTitle = paper.title.toLowerCase().trim();
    if (seen.has(normalizedTitle)) return false;
    seen.add(normalizedTitle);
    return true;
  });

  return deduped.slice(0, ARXIV_CONFIG.maxTotalPapers);
}