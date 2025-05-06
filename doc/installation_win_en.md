# Installation Guide for Windows

[简体中文](installation_win.md) | English

This guide will help you install and run this project on a Windows system.

---

## 1. Clone Repository

First, clone the project repository from GitHub. Open **Command Prompt** or **PowerShell** and run:

```bash
git clone https://github.com/AgathaNetwork/WebMatica.git
```

---

## 2. Install Dependencies

Navigate to the project directory:
```bash
cd WebMatica
```

Install dependencies:
```bash
npm install
```

---

## 3. Start Server

Launch the server:
```bash
npm start
```
The server will run by default at `http://localhost:3000`.

---

## 4. Common Startup Issues

1. **Port in Use**: If the port is occupied by another program, modify the port number in `config/cfg.json`.
2. **Missing Dependencies**: The project requires OpenGL libraries - ensure they are properly installed.