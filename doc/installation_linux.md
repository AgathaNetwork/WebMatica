# Linux 下安装项目说明文档

简体中文 | [English](installation_linux_en.md)

本指南将帮助你在 Linux 系统上安装和运行该项目。

## 1. Clone 仓库

首先，你需要从 GitHub 克隆项目仓库。打开命令提示符或 PowerShell，并运行以下命令：

```bash
git clone https://github.com/AgathaNetwork/WebMatica.git
```

## 2. 安装依赖

Linux 系统需要手动安装 OpenGL 库，并需要 Python 以及模拟窗口环境运行。

执行以下命令安装 OpenGL 库：
```bash
sudo apt-get update
sudo apt-get install -y libcairo2-dev libpango1.0-dev libglib2.0-dev libpng-dev libjpeg-dev
```

执行以下命令安装 XVFB：
```bash
sudo apt-get install -y xvfb
```

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
xvfb-run -s "-ac -screen 0 800x600x24" npm start
```
服务器将默认在 `http://localhost:3000` 上运行。

## 4. 常见启动失败原因
1. 端口被占用：如果你的端口被其他程序占用，请修改 `config/cfg.json` 中的端口号。