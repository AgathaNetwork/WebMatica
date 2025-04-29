const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
// GET /status
router.get('/status', (req, res) => {
    // 获取uuid参数
    const uuid = req.query.uuid || null;
    if(uuid === null){
        return res.status(400).json({
            status: 'error',
            message: 'UUID is required'
        });
    }
    // 检查文件是否存在
    const filePath = path.join(__dirname, '../uploads/doneflag/' + uuid + '.json'); 
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            status: 'error',
            message: 'File not found'
        });
    }
    // 从文件获取doneflag
    const content = fs.promises.readFile(path.join(__dirname, '../uploads/doneflag/' + uuid + '.json'), 'utf8')
    return res.status(200).json({
        status: 'success',
        data: JSON.parse(content)
    });
});

module.exports = router;