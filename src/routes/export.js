const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
router.post('/exportapi', async (req, res) => {
    // POST获取uuid参数
    const uuid = req.body.uuid;
    if (!uuid) {
        return res.status(400).json({
            status: 'error',
            message: 'UUID is required'
        });
    }
    const type = req.body.type;
    if (!type){
        return res.status(400).json({
            status: 'error',
            message: 'Type is required'
        });
    }
    var jsonData;
    if (type == "region"){
        var name = req.body.name;
        const filePath = path.join(__dirname, '../../uploads/info/' + uuid + '-' + name + '.json');
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                status: 'error',
                message: 'File not found'
            });
        }
        // 保存文件信息为JSON
        const content = await fs.promises.readFile(filePath, 'utf8');
        jsonData = JSON.parse(content).material_list;
    }
    else if (type == "whole"){
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
        jsonData = JSON.parse(content).material_sum;
    }
    console.log(JSON.stringify(jsonData));
    //返回jsondata
    return res.status(200).json({
        status: 'success',
        data: JSON.parse(jsonData)
    });
});

module.exports = router;