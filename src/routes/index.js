global.THREE = require('three')
global.Worker = require('worker_threads').Worker
const { createCanvas, ImageData } = require('node-canvas-webgl/lib')
const { Schematic } = require('prismarine-schematic')
const fs = require('fs').promises
const Vec3 = require('vec3').Vec3
const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // 引入 UUID 生成器
const router = express.Router();
const { Viewer, WorldView } = require('prismarine-viewer').viewer

// 配置 multer 存储
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads')); // 保存到 uploads 文件夹
    },
    filename: (req, file, cb) => {
        // 检查文件后缀是否为 .litematica
        const ext = path.extname(file.originalname);
        if (ext !== '.litematica') {
            return cb(new Error('Only .litematica files are allowed'));
        }

        // 生成 UUID 作为文件名
        const uniqueName = `${uuidv4()}${ext}`;

        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

// 文件上传处理路由
router.post('/proceed', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded or invalid file type.');
    }

    // 返回文件的完整路径
    const filePath = path.join(__dirname, '../../uploads', req.file.filename);
    res.send(`File uploaded successfully: ${filePath}`);
});

// 其他路由
router.get('/', (req, res) => { 
    res.render('index', { title: 'Welcome to WebMatica' });
});

module.exports = router;