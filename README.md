# WebMatica

`WebMatica` 是一个基于 Web 的 Litematica 文件查看与处理工具，支持用户上传 `.litematic` 文件，并进行结构解析、区域数据统计、导出等操作。适用于 Minecraft 建筑爱好者和模组开发者。

---

## 📌 功能特性

- **文件上传**：支持上传 `.litematic` 格式的 Minecraft 建筑文件。
- **三维预览**：使用 `Three.js` 渲染建筑结构，提供基础的 3D 查看功能。
- **数据统计**：
  - 按选区（Region）统计材料清单。
  - 按整个文件统计材料总览。
- **数据导出**：
  - 支持 CSV / TXT 格式导出。
  - 支持多种规则（排序、筛选、替换、删除）对数据进行预处理。

---

## 🧩 技术架构

### 后端（Node.js + Express）
- **路由管理**：
  - `/proceed`：接收 `.litematic` 文件并启动处理流程。
  - `/status`：查询处理状态。
  - `/region` & `/regionsum`：获取特定选区或整体的材料数据。
  - `/exportapi`：根据规则导出统计数据。
- **核心模块**：
  - 使用 `deepslate` 解析 `.litematic` 文件。
  - 使用 `prismarine-viewer` 渲染 3D 场景。
  - 数据处理逻辑包含异步读写、转换、过滤、排序、分组等。
- **持久化**：
  - 原始文件存储于 `/uploads/file/`
  - 中间结果存储于 `/uploads/info/` 与 `/uploads/gltf/`
  - 导出文件存放于 `/uploads/export/`

### 前端（EJS + Bootstrap + JavaScript）
- **页面结构**：
  - `index.ejs`：上传页面。
  - `procpage.ejs`：处理中状态页。
  - `detail.ejs`：详情查看页（含 3D 预览）。
  - `exportpage.ejs`：导出配置与预览页。
- **交互逻辑**：
  - 异步加载数据并渲染选区。
  - 拖拽排序规则。
  - 模态框添加不同类型的处理规则。
  - 下载导出结果。

---

## 📦 目录结构

```
.
├── controllers/
│   └── index.js
├── models/
│   └── index.js
├── routes/
│   ├── exportapi.js
│   ├── index.js
│   ├── region.js
│   └── status.js
├── views/
│   ├── detail.ejs
│   ├── exportpage.ejs
│   ├── index.ejs
│   └── procpage.ejs
└── app.js
```

---

## 🛠️ 开发依赖

- Node.js >= 16.x
- Express
- Three.js
- prismarine-viewer
- deepslate
- multer
- fast-csv
- sortable.js

---

## 🚀 快速开始

```bash
npm install
npm start
```

访问 `http://localhost:3000` 即可使用。

---

## 📝 许可证

本项目受 [MIT License](LICENSE) 保护。  
软件受版权法保护，原作者保留署名权利。