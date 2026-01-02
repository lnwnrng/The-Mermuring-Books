# The Mermuring Books（呓语书屋）

这是一个全栈书店 Web 应用，前端基于 React/Vite，后端基于 Node.js/Express/TypeScript。界面包含图书浏览、详情、收藏、购物车与结算、个人中心以及后台管理。后端提供 Express + Prisma 的基础结构，路由位于 `backend/src/routes`。

## 网页截图
请将你的截图放到 `docs/screenshot.png`，下方图片会自动展示。

![首页](docs/screenshot.png)

## 技术栈
- 前端：React、Vite、TypeScript
- 后端：Node.js、Express、TypeScript
- ORM：Prisma
- 数据库：默认 MySQL（可通过 `DATABASE_URL` 配置）

## 项目结构
```
.
+-- backend/                 # Express + Prisma API
|   +-- src/                 # TypeScript 源码
|   +-- prisma/              # Prisma schema 与 migrations
|   `-- dist/                # 构建产物（已忽略）
`-- frontend/                # Vite + React 应用
    +-- components/          # 组件
    +-- services/            # API 调用封装
    `-- dist/                # 构建产物（已忽略）
```

## 环境要求
- Node.js 18+ 与 npm
- MySQL（或按需调整 `DATABASE_URL`）

## 本地启动（开发模式）

### 1) 后端 API
```bash
cd backend
npm install
cp .env.example .env
```
Windows PowerShell 请使用 `Copy-Item .env.example .env`。

编辑 `backend/.env`，设置：
- `DATABASE_URL`
- `JWT_SECRET`
- `ADMIN_EMAIL` 与 `ADMIN_PASSWORD`（用于初始化管理员）

生成 Prisma Client 并启动开发服务：
```bash
npm run prisma:generate
npm run dev
```
默认地址：`http://localhost:4000`

可选：初始化管理员账号（确保已设置环境变量）：
```bash
npm run seed:admin
```

### 2) 前端应用
```bash
cd frontend
npm install
```
创建或修改 `frontend/.env.local`：
```bash
VITE_API_BASE_URL=http://localhost:4000/api
```
启动开发服务：
```bash
npm run dev
```
Vite 会输出本地访问地址（通常为 `http://localhost:5173`）。

## 生产构建与运行

### 后端
```bash
cd backend
npm run build
npm run start
```

### 前端
```bash
cd frontend
npm run build
npm run preview
```

## 环境变量

### backend/.env
- `PORT`（默认 4000）
- `DATABASE_URL`（示例：`mysql://user:pass@localhost:3306/db`）
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

### frontend/.env.local
- `VITE_API_BASE_URL`（API 基础地址）

## GitHub 提交说明
- 根目录 `.gitignore` 已排除构建产物、`node_modules` 与本地环境变量文件。
- 若这些文件已被提交，请执行 `git rm -r --cached node_modules dist` 并提交删除记录。
