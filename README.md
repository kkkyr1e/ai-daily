# AI Daily

每日自动生成的 AI 领域动态日报。

## 功能

- 自动抓取 OpenAI、DeepMind、HuggingFace 博客
- 获取 arXiv 最新 AI/ML 论文
- 发现 GitHub 热门 AI 项目
- Claude 整理生成中英混合日报
- 发布到 GitHub Pages

## 本地运行

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入 ANTHROPIC_API_KEY

# 运行
npx ts-node src/index.ts
```

## 自动部署

项目使用 GitHub Actions，每天北京时间早 8 点自动运行。

需要在 GitHub 仓库设置中添加 Secret：
- `ANTHROPIC_API_KEY`: Claude API Key

## 输出

- `daily/`: Markdown 格式日报
- `docs/`: GitHub Pages 网站