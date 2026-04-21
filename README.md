<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e0498138-8992-475d-97f6-93931acfad62

## 部署说明 (Deployment)

### 1. 推送到 GitHub
代码已配置为推送到：`https://github.com/MaomaoBuhuiJAVA/haoyun-academy.git`

### 2. 部署到 Vercel (推荐)
由于本项目包含 Express 后端和 Prisma 数据库，建议使用 Vercel 进行部署：
- 关联 GitHub 仓库。
- Vercel 会识别 `vercel.json` 并自动配置 Serverless Functions。
- **环境变量**：在 Vercel 中设置 `DATABASE_URL` (或 `POSTGRES_PRISMA_URL`)。
- **构建命令**：`npm run build` (已配置为先运行 `prisma generate`)。

> **注意**：GitHub Pages 仅支持静态网页，无法运行本项目中的 Express 后端。
