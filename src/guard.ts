// src/guard.ts
import type { RssItem } from "./scrapers/rss";
import type { ArxivPaper } from "./scrapers/arxiv";
import type { GitHubRepo } from "./scrapers/github";

export interface DailyContent {
  newsItems: RssItem[];
  papers: ArxivPaper[];
  repos: GitHubRepo[];
}

export function validateContent(content: DailyContent): {
  hasContent: boolean;
  summary: string;
} {
  const { newsItems, papers, repos } = content;
  const total = newsItems.length + papers.length + repos.length;

  return {
    hasContent: total > 0,
    summary: `News: ${newsItems.length}, Papers: ${papers.length}, Repos: ${repos.length}`,
  };
}