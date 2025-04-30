const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

async function constructTable(material, rules){

}
router.get('/export_csv_whole', async (req, res) => {
    // 获取uuid参数
    const uuid = req.query.uuid;
    // 从文件夹中读取sum信息
    const filePath = path.join(__dirname, '../../uploads/info/' + uuid + '.json');
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            status: 'error',
            message: 'File not found'
        });
    }
    // 保存文件信息为JSON
    const content = await fs.promises.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(content);
    // 处理数据并导出为CSV
    
    
    res.status(200).send(`Exporting data for UUID: ${uuid}`);
});


router.get('/regionsum', async (req, res) => {
    
    return res.status(200).json({
        status: 'success',
        data: JSON.parse(content)
    });
});

module.exports = router;