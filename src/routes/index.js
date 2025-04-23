const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// 配置 multer 存储
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads')); // 保存到 uploads 文件夹
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // 使用时间戳命名文件
    }
});
const upload = multer({ storage });

// 文件上传处理路由
router.post('/proceed', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send(`File uploaded successfully: ${req.file.filename}`);
});

// 其他路由
router.get('/', (req, res) => { 
    res.render('index', { title: 'Welcome to WebMatica' });
});

module.exports = router;