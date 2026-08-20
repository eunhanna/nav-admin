# Euno Admin

独立的 Euno 管理端，使用 Vite、React、Ant Design 和 HashRouter 构建。

## 开发

```bash
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

默认地址为 `http://localhost:3001/#/dashboard`。设置 `VITE_API_URL` 为 nav-api 根地址（不含 `/api/v1`）；登录页为 `/#/login`，真实入口管理页为 `/#/sites`。

## GitHub Pages

推送到 `main` 会触发 `.github/workflows/deploy-pages.yml`。工作流为 `admin.eunhacc.cyou` 自定义域名使用 Vite 根路径 `/`；HashRouter 支持刷新后的客户端路由。若改回默认 GitHub Project Pages 域名，需要将工作流中的 `VITE_BASE_PATH` 改为 `/${仓库名}/`。

在仓库 Settings → Pages 中，将 Source 设为 **GitHub Actions**。生产 API 地址由工作流设置为 `https://api.eunhacc.cyou`，API 的 `ALLOWED_ORIGINS` 必须包含实际 Pages 域名。
