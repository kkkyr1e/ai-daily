// src/index.ts
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { RSS_SOURCES, OUTPUT_CONFIG } from "../config";
import { fetchAllRssFeeds } from "./scrapers/rss";
import { fetchAllArxivPapers } from "./scrapers/arxiv";
import { fetchTrendingRepos } from "./scrapers/github";
import { summarizeWithRetry, generateEmptyDigest } from "./summarizer";
import { renderPage, renderList, copyStyleIfNeeded } from "./renderer";
import { validateContent } from "./guard";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function main(): Promise<void> {
  console.log("🚀 AI Daily 开始运行...");

  const today = formatDate(new Date());
  const { dailyDir, docsDir } = OUTPUT_CONFIG;

  // 确保目录存在
  ensureDir(dailyDir);
  ensureDir(docsDir);

  // 并行抓取所有数据源
  console.log("📡 抓取数据源...");
  const [newsItems, papers, repos] = await Promise.all([
    fetchAllRssFeeds([...RSS_SOURCES.blogs, ...RSS_SOURCES.papers]),
    fetchAllArxivPapers(RSS_SOURCES.papers),
    fetchTrendingRepos(),
  ]);

  const { hasContent, summary } = validateContent({ newsItems, papers, repos });
  console.log(`📊 抓取结果: ${summary}`);

  // 生成日报内容
  let digest: string;
  if (hasContent) {
    console.log("🤖 调用 Claude 生成日报...");
    digest = await summarizeWithRetry(newsItems, papers, repos);
  } else {
    console.log("⚠️ 无新内容，生成占位日报");
    digest = generateEmptyDigest();
  }

  // 保存 Markdown 文件
  const mdPath = path.join(dailyDir, `${today}.md`);
  fs.writeFileSync(mdPath, digest, "utf-8");
  console.log(`📝 Markdown 保存至 ${mdPath}`);

  // 生成并保存 HTML
  copyStyleIfNeeded(docsDir);
  const htmlContent = renderPage(digest, today);
  const htmlPath = path.join(docsDir, `${today}.html`);
  fs.writeFileSync(htmlPath, htmlContent, "utf-8");
  console.log(`🌐 HTML 保存至 ${htmlPath}`);

  // 更新首页列表
  const htmlFiles = fs
    .readdirSync(docsDir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.html$/.test(f))
    .map((f) => f.replace(".html", ""))
    .sort((a, b) => b.localeCompare(a));

  const indexHtml = renderList(htmlFiles);
  fs.writeFileSync(path.join(docsDir, "index.html"), indexHtml, "utf-8");
  console.log("📋 首页列表已更新");

  console.log("✅ 完成！");
}

main().catch((err) => {
  console.error("❌ 运行失败:", err);
  process.exit(1);
});