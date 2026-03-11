// src/scrapers/github.ts
import { GITHUB_CONFIG } from "../../config";

export interface GitHubRepo {
  name: string;
  description: string;
  stars: number;
  url: string;
  language: string;
  pushedAt: string;
}

async function searchRepos(query: string): Promise<GitHubRepo[]> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (token) {
    headers.Authorization = `token ${token}`;
  }

  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?${query}`,
      { headers }
    );

    if (!response.ok) {
      console.warn(`[WARN] GitHub API error: ${response.status}`);
      return [];
    }

    const data = await response.json() as { items?: any[] };
    return (data.items || []).slice(0, GITHUB_CONFIG.maxRepos).map((repo: any) => ({
      name: repo.full_name,
      description: repo.description || "",
      stars: repo.stargazers_count,
      url: repo.html_url,
      language: repo.language || "Unknown",
      pushedAt: repo.pushed_at,
    }));
  } catch (error) {
    console.warn(`[WARN] GitHub search failed: ${error}`);
    return [];
  }
}

export async function fetchTrendingRepos(): Promise<GitHubRepo[]> {
  const daysAgo = GITHUB_CONFIG.daysLookback;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const dateStr = date.toISOString().split("T")[0];

  // 两个查询并行
  const [activeRepos, newRepos] = await Promise.all([
    searchRepos(
      `q=topic:machine-learning+pushed:>${dateStr}&sort=stars&order=desc&per_page=10`
    ),
    searchRepos(
      `q=topic:machine-learning+created:>${dateStr}&sort=stars&order=desc&per_page=10`
    ),
  ]);

  // 合并去重
  const seen = new Set<string>();
  const allRepos = [...activeRepos, ...newRepos];
  return allRepos.filter((repo) => {
    if (seen.has(repo.name)) return false;
    seen.add(repo.name);
    return true;
  });
}