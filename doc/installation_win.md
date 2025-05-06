# Windows 下安装项目说明文档

简体中文 | [English](installation_win_en.md)

本指南将帮助你在 Windows 系统上安装和运行该项目。

## 1. Clone 仓库

首先，你需要从 GitHub 克隆项目仓库。打开命令提示符或 PowerShell，并运行以下命令：

```bash
git clone https://github.com/AgathaNetwork/WebMatica.git
```

## 2. 安装依赖
进入项目目录：
```bash
cd WebMatica
```

安装依赖：
```bash
npm install
```

## 3. 启动服务器
启动服务器：
```bash
npm start
```
服务器将默认在 `http://localhost:3000` 上运行。

## 4. 常见启动失败原因
1. 端口被占用：如果你的端口被其他程序占用，请修改 `config/cfg.json` 中的端口号。
2. 缺少依赖：项目需要OpenGL库，请确保已安装。