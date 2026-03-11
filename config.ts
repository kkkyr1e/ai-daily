// config.ts
export const RSS_SOURCES = {
  blogs: [
    "https://openai.com/news/rss.xml",
    "https://deepmind.google/blog/rss.xml",
    "https://huggingface.co/blog/feed.xml",
  ],
  papers: [
    "http://export.arxiv.org/RSS/cs.AI",
    "http://export.arxiv.org/RSS/cs.LG",
  ],
};

export const ARXIV_CONFIG = {
  maxPapersPerFeed: 10,
  maxTotalPapers: 15,
  maxSummaryLength: 200,
};

export const GITHUB_CONFIG = {
  daysLookback: 7,
  maxRepos: 10,
};

export const OUTPUT_CONFIG = {
  dailyDir: "./daily",
  docsDir: "./docs",
};