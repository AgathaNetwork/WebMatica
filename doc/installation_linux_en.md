# Installation Guide for Linux

[简体中文](installation_linux.md) | English

This guide will help you install and run this project on a Linux system.

## 1. Clone Repository

First, you need to clone the project repository from GitHub. Open your terminal and run:

```bash
git clone https://github.com/AgathaNetwork/WebMatica.git
```

## 2. Install Dependencies

Linux requires manual installation of OpenGL libraries and needs Python and a virtual display environment to run.

Install OpenGL libraries:
```bash
sudo apt-get update
sudo apt-get install -y libcairo2-dev libpango1.0-dev libglib2.0-dev libpng-dev libjpeg-dev
```

Install XVFB:
```bash
sudo apt-get install -y xvfb
```

Navigate to project directory:
```bash
cd WebMatica
```

Install dependencies:
```bash
npm install
```

## 3. Start Server

Launch the server with virtual display:
```bash
xvfb-run -s "-ac -screen 0 800x600x24" npm start
```
The server will run by default at `http://localhost:3000`.

## 4. Common Startup Issues
1. **Port in Use**: If your port is occupied by another program, modify the port number in `config/cfg.json`.