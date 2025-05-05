const express = require('express');
const path = require('path');
const routes = require('./routes/index');
const statusRoute = require('./routes/status');
const regionRoute = require('./routes/region');
const exportApiRoute = require('./routes/exportapi');
const app = express();
const fs = require('fs');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config', 'cfg.json'), 'utf8'));
const PORT = config.port;
const AutoDelete = config.autodelete;

function deleteOldFiles() {
    function walk(dir) {
        let files;
        try {
            files = fs.readdirSync(dir);
        } catch (err) {
            console.error(`Failed to read directory ${dir}:`, err.message);
            return;
        }

        for (const file of files) {
            const fullPath = path.join(dir, file);
            let stats;
            try {
                stats = fs.statSync(fullPath);
            } catch (err) {
                console.error(`Failed to stat ${fullPath}:`, err.message);
                continue;
            }

            if (stats.isFile()) {
                const now = Date.now();
                const lastModified = stats.mtimeMs;
                if (now - lastModified > AutoDelete * 1000) {
                    fs.unlink(fullPath, (err) => {
                        if (err) {
                            console.error(`Failed to delete file ${fullPath}:`, err.message);
                        } else {
                            console.log(`Deleted old file: ${fullPath}`);
                        }
                    });
                }
            } else if (stats.isDirectory()) {
                walk(fullPath); // 递归进入子目录
            }
        }
    }

    walk(path.join(__dirname, '../uploads'));
}

// 启动定时任务，每 10 秒运行一次
setInterval(deleteOldFiles, 10000);

// 初始运行一次
if(AutoDelete != -1) deleteOldFiles();
// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // 暴露 uploads 文件夹

// 新增路由文件引入

// Routes
app.use('/', routes);
app.use('/', statusRoute);
app.use('/', regionRoute);
app.use('/', exportApiRoute); // 新增路由

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});