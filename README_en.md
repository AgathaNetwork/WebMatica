# WebMatica

[简体中文](README.md) | English

`WebMatica` is a web-based Litematica file viewing and processing tool that supports user uploads of `.litematic` files and performs structure parsing, area data statistics, exporting, and other operations. It is suitable for Minecraft architecture enthusiasts and mod developers.

---

## 📌 Features

- **File Upload**: Supports uploading Minecraft building files in `.litematic` format.
- **3D Preview**: Renders architectural structures using `Three.js`, providing basic 3D viewing functionality.
- **Data Statistics**:
  - Generates material lists by selected region.
  - Provides an overall material overview for the entire file.
- **Data Export**:
  - Supports exporting in CSV / TXT formats.
  - Supports various rules (sorting, filtering, replacing, deleting) to preprocess data.
- **Automatic Cleanup of Expired Files**:
  - Configurable automatic deletion of uploaded and exported files older than a specified time.
  - Set the `autodelete` field in `cfg.json` (unit: seconds). For example, `3600` means one hour.

---

## 🧩 Technical Architecture

### Backend (Node.js + Express)
- **Routing Management**:
  - `/proceed`: Receives `.litematic` files and initiates the processing workflow.
  - `/status`: Queries the processing status.
  - `/region` & `/regionsum`: Retrieves material data for specific regions or the whole file.
  - `/exportapi`: Exports statistical data based on rules.
- **Core Modules**:
  - Uses `deepslate` to parse `.litematic` files.
  - Uses `prismarine-viewer` to render 3D scenes.
  - Data processing logic includes asynchronous reading/writing, conversion, filtering, sorting, etc.
- **Persistence**:
  - Original files are stored in `/uploads/file/`.
  - Intermediate results are stored in `/uploads/info/` and `/uploads/gltf/`.
  - Exported files are stored in `/uploads/export/`.
- **Automatic Cleanup Mechanism**:
  - The application scans the `uploads` directory every 10 seconds.
  - If configured, deletes files whose modification time exceeds the `AutoDelete` configuration value.

### Frontend (EJS + Bootstrap + JavaScript)
- **Page Structure**:
  - `index.ejs`: Upload page.
  <div style="text-align: center;">
    <img src="img/index.png" alt="" width="500" />
  </div>

  - `procpage.ejs`: Processing state page.

  <div style="text-align: center;">
    <img src="img/proceed.png" alt="" width="500" />
  </div>

  - `detail.ejs`: Details viewing page (including 3D preview).

  <div style="text-align: center;">
    <img src="img/detail.png" alt="" width="500" />
  </div>

  <div style="text-align: center;">
    <img src="img/detail_file.png" alt="" width="500" />
  </div>

  - `exportpage.ejs`: Export configuration and preview page.

  <div style="text-align: center;">
    <img src="img/export.png" alt="" width="500" />
  </div>

- **Interaction Logic**:
  - Asynchronously loads and renders regions.
  - Drag-and-drop rule sorting.
  - Modal dialogs for adding different types of processing rules.
  - Downloads exported results.

---

## 📦 Directory Structure

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
│   ├── license.ejs
│   └── procpage.ejs
└── app.js
```

---

## ⚙️ Configuration Instructions

### `config/cfg.json`

```json
{
  "port": 3000,
  "autodelete": 3600
}
```

- `port`: Sets the port number for server listening.
- `autodelete`: Threshold time (in seconds) for automatically deleting old files in the upload directory. Setting it to `-1` disables automatic deletion.

---

## 🚀 Quick Start

After cloning the project, execute the following commands in the project root directory to install dependencies and start the server:

```bash
npm install
npm start
```

Visit `http://localhost:3000` to use the application.

---

## 📝 License

The project allows you to freely use, copy, and modify the software, but you must retain the original author's attribution and may not sell the software.