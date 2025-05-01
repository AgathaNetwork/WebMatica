const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const version = "1.21.4";
const mcData = require('minecraft-data')(version);

// 监听 /exportapi 的 POST 请求

var langData;
var localeData;

async function getStackSize(itemName) {
    // 匹配 "minecraft:" 后的内容
    const match = itemName.match(/^minecraft:(.+)$/i);
    if (!match) return null;
    
    itemName_ = match[1];
    const item = await mcData.itemsByName[itemName_];
    const block = await mcData.blocksByName[itemName_];
    if (item == null && block == null) {
        return 64;
    }
    if (item != null) {
        return item.stackSize;
    }
    if (block != null) {
        return block.stackSize;
    }
}

function translateItemIdToChinese(itemId) {
    // 匹配 "minecraft:" 后的内容
    const match = itemId.match(/^minecraft:(.+)$/i);
    if (!match) return null;
    
    const itemName = match[1];
    // 构造本地化键
    const itemKey = `item.minecraft.${itemName}`;
    const blockKey = `block.minecraft.${itemName}`;
    var translation = null;
    translation = localeData[itemKey];
    if (translation == null) {
        translation = localeData[blockKey];
    }
    if (translation == null) {
        translation = itemName;
    }
    return translation;
}
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
    if (!type) {
        return res.status(400).json({
            status: 'error',
            message: 'Type is required'
        });
    }
    var jsonData;
    langData = await fs.promises.readFile(path.join(__dirname, '../../config/lang.json'), 'utf-8');
    localeData = JSON.parse(langData);
    if (type == "region") {
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
    } else if (type == "whole") {
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
    // 获取规则列表
    const rules = req.body.rules;
    try {
        // 使用 for...of 实现异步遍历
        for (const rule of rules) {
            if (rule.type === "delete") {
                // 遍历 jsonData，如果在 rule.strings 中发现了，则删除
                jsonData = jsonData.filter(item => !rule.strings.includes(item.name));
            }
            if (rule.type === "sort"){
                if(rule.method === "id_asc"){
                    jsonData.sort((a, b) => a.name.localeCompare(b.name));
                }else if(rule.method === "id_desc"){
                    jsonData.sort((a, b) => b.name.localeCompare(a.name));
                }else if(rule.method === "pinyin_asc"){
                    jsonData.sort((a, b) => a.locale.localeCompare(b.locale));
                }else if(rule.method === "pinyin_desc"){
                    jsonData.sort((a, b) => b.locale.localeCompare(a.locale));
                }else if(rule.method === "quantity_asc"){
                    jsonData.sort((a, b) => a.count - b.count);
                }else if(rule.method === "quantity_desc"){
                    jsonData.sort((a, b) => b.count - a.count);
                }
            }
            if (rule.type === "replace") {
                const replaceName = rule.replace;
                const findName = rule.find;

                let hasExistence = -1;
                // 第一次遍历寻找目标替换项位置（可选：可用 findIndex 替换）
                for (let i = 0; i < jsonData.length; i++) {
                    if (jsonData[i].name === replaceName) {
                        hasExistence = i;
                        break;
                    }
                }
                // 倒序遍历防止 splice 造成索引跳过
                for (let i = jsonData.length - 1; i >= 0; i--) {
                    const item = jsonData[i];

                    if (item?.name === findName) {
                        if (hasExistence === -1) {
                            // 目标不存在，直接替换当前项名称
                            item.name = replaceName;
                            item.locale = translateItemIdToChinese(replaceName);
                        } else {
                            // 目标已存在，合并数量后删除当前项
                            jsonData[hasExistence].count += item.count;
                            jsonData.splice(i, 1);
                        }
                    }
                }
            }
            if (rule.type === "gt"){
                jsonData = jsonData.filter(item => item.count <= rule.value);
            }
            if (rule.type === "lt"){
                jsonData = jsonData.filter(item => item.count >= rule.value);
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
    var fname = uuid + '-' + Date.now();
    //如果不存在文件夹则创建
    if (!fs.existsSync(path.join(__dirname, '../../uploads/export/'))) {
        fs.mkdirSync(path.join(__dirname, '../../uploads/export/'));
    }
    if (req.body.exportOptions.countFormat == "item"){
        for(json of jsonData){
            json.count_processed = json.count + "个";
        }
    }
    else if (req.body.exportOptions.countFormat == "group"){
        for(json of jsonData){
            var stackSize = await getStackSize(json.name);
            json.count_processed = Math.floor(json.count/stackSize) + "组" + (json.count%stackSize) + "个";
        }
    }
    else if (req.body.exportOptions.countFormat == "box"){
        for(json of jsonData){
            var stackSize = await getStackSize(json.name);
            var boxSize = stackSize * 27;
            json.count_processed = Math.floor(json.count/boxSize) + "盒" + Math.floor((json.count%boxSize)/stackSize) + "组" + (json.count%boxSize%stackSize) + "个";
        }
    }
    else if (req.body.exportOptions.countFormat == "box_inbox"){
        for(json of jsonData){
            var stackSize = await getStackSize(json.name);
            var boxSize = stackSize * 27;
            var inboxSize = boxSize * 27;
            json.count_processed = Math.floor(json.count/inboxSize) + "箱" + Math.floor((json.count%inboxSize)/boxSize) + "盒" + Math.floor((json.count%inboxSize%boxSize)/stackSize) + "组" + (json.count%inboxSize%boxSize%stackSize) + "个";
        }
    }
    if (req.body.exportOptions.fileFormat == "csv"){
        const csvFilePath = path.join(__dirname, '../../uploads/export/', `${fname}.csv`);
        const ws = fs.createWriteStream(csvFilePath);
        ws.write('\uFEFF');
        csv.write(jsonData, {
                headers: ['方块ID', '名称', '数量'],
                transform: (row) => ({
                    '方块ID': row.name,
                    '名称': row.locale,
                    '数量': row.count_processed
                })
            })
            .pipe(ws)
            .on('finish', () => {
                console.log('CSV file has been written successfully.');
            }
        );
        return res.status(200).json({
            status: 'success',
            file: fname + ".csv"
        });
    }
    else if (req.body.exportOptions.fileFormat == "txt"){ 
        const csvFilePath = path.join(__dirname, '../../uploads/export/', `${fname}.txt`);
        const ws = fs.createWriteStream(csvFilePath);
        csv.write(jsonData, {
                transform: (row) => ({
                    '方块ID': row.name,
                    '名称': row.locale,
                    '数量': row.count_processed
                })
            })
            .pipe(ws)
            .on('finish', () => {
                console.log('TXT file has been written successfully.');
            }
        );
        return res.status(200).json({
            status: 'success',
            file: fname + ".txt"
        });
    }

    // 返回jsondata
    return res.status(200).json({
        status: 'success',
        data: jsonData
    });
});

module.exports = router;