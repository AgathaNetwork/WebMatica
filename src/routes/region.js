const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
// GET /status
router.get('/region', async (req, res) => {
    // 获取uuid参数
    const uuid = req.query.uuid || null;
    const name = req.query.name || null;
    if(uuid === null || name === null){
        return res.status(400).json({
            status: 'error',
            message: 'UUID and Name are required'
        });
    }
    // 检查文件是否存在
    const filePath = path.join(__dirname, '../../uploads/info/' + uuid + '-' + name + '.json'); 
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            status: 'error',
            message: 'File not found'
        });
    }
    // 从文件获取doneflag
    const content = await fs.promises.readFile(path.join(__dirname, '../../uploads/info/' + uuid + '-' + name + '.json'), 'utf8')
    return res.status(200).json({
        status: 'success',
        data: JSON.parse(content)
    });
});

module.exports = router;