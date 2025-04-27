global.THREE = require('three')
global.Worker = require('worker_threads').Worker
const { createCanvas, ImageData } = require('node-canvas-webgl/lib')
const fs = require('fs').promises
const Vec3 = require('vec3').Vec3
const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // 引入 UUID 生成器
const router = express.Router();
const { Viewer, WorldView } = require('prismarine-viewer').viewer



async function __stripNBTTyping(nbtData, deepslate) {
  if (nbtData.hasOwnProperty("type")) {
    switch(deepslate.NbtType[nbtData.type]) {
      case "Compound":
        var newDict = {}
        for (const [k, v] of Object.entries(nbtData.value)) {
          newDict[k] = await __stripNBTTyping(v, deepslate);
        }
        return newDict;
        break;
      case "List":
        var newList = [];
        for (const [k, v] of Object.entries(nbtData.value.items)) {
          newList[k] = await __stripNBTTyping(v, deepslate);
        }
        return newList;
        break;
      default:
        return nbtData.value;
    } 
  } else {
    switch(nbtData.constructor) {
      case Object:
        var newDict = {}
        for (const [k, v] of Object.entries(nbtData)) {
          newDict[k] = await __stripNBTTyping(v, deepslate);
        }
        return newDict;
        break;
      default:
        return nbtData;
    }
  }
}



async function processBlocks(blockData, width, height, depth, y_shift, z_shift, mask, nbits) {
    
    var blocks = new Array();
    for (let x = 0; x < Math.abs(width); x++) {
        blocks[x] = new Array();
        for (let y = 0; y < Math.abs(height); y++) {
            blocks[x][y] = new Array();
            for (let z = 0; z < Math.abs(depth); z++) {
                blocks[x][y][z] = await processSingleBlock(blockData, x, y, z, y_shift, z_shift, mask, nbits);
            }
        }
    }
    return blocks;
}

async function processSingleBlock(blockData, x, y, z, y_shift, z_shift, mask, nbits) {
    const index = y * y_shift + z * z_shift + x;
    const start_offset = index * nbits;
    const start_arr_index = start_offset >>> 5;
    const end_arr_index = ((index + 1) * nbits - 1) >>> 5;
    const start_bit_offset = start_offset & 0x1F;
    const half_ind = start_arr_index >>> 1;

    let blockStart, blockEnd;
    if ((start_arr_index & 0x1) === 0) {
        blockStart = blockData[half_ind][1];
        blockEnd = blockData[half_ind][0];
    } else {
        blockStart = blockData[half_ind][0];
        if (half_ind + 1 < blockData.length) {
            blockEnd = blockData[half_ind + 1][1];
        } else {
            blockEnd = 0x0; // 防止越界
        }
    }

    if (start_arr_index === end_arr_index) {
        //console.log((blockStart >>> start_bit_offset) & mask)
        return (blockStart >>> start_bit_offset) & mask;
    } else {
        const end_offset = 32 - start_bit_offset;
        //console.log(((blockStart >>> start_bit_offset) & mask) | ((blockEnd << end_offset) & mask))
        return ((blockStart >>> start_bit_offset) & mask) | ((blockEnd << end_offset) & mask);
    }
}


const proceed_litematic = async (filePath, fileUUID) => {
    const deepslate = await import('deepslate');
    
    try {
        // 读取 .litematic 文件
        const data = await fs.readFile(filePath);
        const nbtdata = deepslate.NbtFile.read(new Uint8Array(data), {compression: 'gzip'}).toJson();
        const regions = nbtdata.root.Regions.value;

        for (let regionName in regions) { // 使用 for...of 循环
            console.log(`Region Name: ${regionName}`);
            var region = regions[regionName].value;
            const Sx = Math.abs(region.Size.value.x.value);
            const Sy = Math.abs(region.Size.value.y.value);
            const Sz = Math.abs(region.Size.value.z.value);

            const viewDistance = 8
            const version = '1.21.4'
            const registry = require('prismarine-registry')(version)
            const BlockReg = require('prismarine-block')(registry)
            const World = require('prismarine-world')(version)
            const Chunk = require('prismarine-chunk')(version)
            const center = new Vec3(30, 90, 30)
            const canvas = createCanvas(512, 512)
            const renderer = new THREE.WebGLRenderer({ canvas })
            const viewer = new Viewer(renderer, false)

            const world = await new World(() => new Chunk())

            var blockPalette = await __stripNBTTyping(region.BlockStatePalette, deepslate);
            
            console.log(JSON.stringify(blockPalette))
            var nbits = Math.ceil(Math.log2(blockPalette.length));
            var width = region.Size.value.x.value;
            var height = region.Size.value.y.value;
            var depth = region.Size.value.z.value;

            var blockData = region.BlockStates.value;
            
            var mask = (1 << nbits) - 1;
            var y_shift = Math.abs(width * depth);
            var z_shift = Math.abs(width);
            var blocks = await processBlocks(blockData, width, height, depth, y_shift, z_shift, mask, nbits);
            await world.initialize((x, y, z) => {
                const blockId = blocks[x][y][z]
                const blockName = blockPalette[blockId].Name
                var blockProperties = blockPalette[blockId].Properties
                if(blockProperties == null) {
                    blockProperties = {}
                }
                return BlockReg.fromProperties(blockName.replace("minecraft:",""), blockProperties)

                
            }, Sz, Sx, Sy, new Vec3(0, 0, 0))
            
            if (!viewer.setVersion(version)) {
                throw new Error(`Failed to set viewer version to ${version}`);
            }
        
            const worldView = new WorldView(world, viewDistance, center)
            viewer.listen(worldView)
        
            viewer.camera.position.set(center.x, center.y, center.z)
        
            const point = new THREE.Vector3(0, 60, 0)
        
            viewer.camera.lookAt(point)
        
            await worldView.init(center)
            await new Promise(resolve => setTimeout(resolve, 3000))
            await renderer.render(viewer.scene, viewer.camera)
            const { Blob, FileReader } = require('vblob')
        
            global.window = global
            global.Blob = Blob
            global.FileReader = FileReader
            global.THREE = THREE
            global.ImageData = ImageData
            global.document = {
                createElement: (nodeName) => {
                    if (nodeName !== 'canvas') throw new Error(`Cannot create node ${nodeName}`)
                    const canvas = createCanvas(256, 256)
                    return canvas
                }
            }

            // 检查 viewer.scene 是否为有效的 THREE.Scene 对象
            if (!(viewer.scene instanceof THREE.Scene)) {
                throw new Error('viewer.scene is not a valid THREE.Scene object');
            }
            // 手动遍历 viewer.scene.children
            if (viewer.scene && viewer.scene.children) {
                // 过滤掉 AmbientLight 和 DirectionalLight 节点
                viewer.scene.children = viewer.scene.children.filter((node) => {
                    if (node.type === 'AmbientLight' || node.type === 'DirectionalLight') {
                        if (node.type === 'DirectionalLight' && node.target) {
                            viewer.scene.remove(node.target); // 移除 DirectionalLight 的 target
                        }
                        return false; // 从 children 中移除
                    }
                    return true; // 保留其他节点
                });
            }
            console.log(JSON.stringify(viewer.scene.children));
            const GLTFExporter = require('three-gltf-exporter'); // Import GLTFExporter
            // 导出 GLTF 文件
            const gltfExporter = new GLTFExporter();
            // 检查GLTF文件夹是否存在
            await fs.mkdir(path.join(__dirname, '../../uploads/gltf'), { recursive: true });
            await fs.writeFile(
                `uploads/gltf/${fileUUID}-${regionName}.gltf`,
                await new Promise((resolve) =>
                    gltfExporter.parse(viewer.scene, (result) => resolve(JSON.stringify(result)), {
                        embedImages: true,
                        binary: false
                    })
                )
            );
            console.log(`${regionName} GLTF saved successfully.`);
        }
    } catch (err) {
        console.error(`Error processing .litematic file: ${err.message}`);
        throw err;
    }


};
// 配置 multer 存储
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 检查 uploads 文件夹是否存在
        fs.mkdir(path.join(__dirname, '../../uploads/file'), { recursive: true })
        cb(null, path.join(__dirname, '../../uploads/file')); // 保存到 uploads 文件夹
    },
    filename: (req, file, cb) => {
        // 检查文件后缀是否为 .litematica 或 .schem
        const ext = path.extname(file.originalname);
        if (ext !== '.litematic') {
            return cb(new Error('Only .litematic files are allowed'));
        }
        // 生成 UUID 作为文件名
        const uuid = uuidv4();
        file.uuid = uuid; // 将 UUID 存储在文件对象中
        const uniqueName = `${uuid}${ext}`;
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
    const filePath = path.join(__dirname, '../../uploads/file', req.file.filename);
    const fileUUID = req.file.uuid; // 获取 UUID
    res.send(`File uploaded successfully: ${filePath}`);
    if(filePath.endsWith('.litematic')){
        proceed_litematic(filePath, fileUUID).then(() => {
            console.log('File processed successfully');
        }).catch(err => {
            console.error('Error processing file:', err);
        });
    }
});

// 其他路由
router.get('/', (req, res) => { 
    res.render('index', { title: 'Welcome to WebMatica' });
});

module.exports = router;