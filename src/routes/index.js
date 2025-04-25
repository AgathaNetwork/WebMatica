global.THREE = require('three')
global.Worker = require('worker_threads').Worker
const { createCanvas, ImageData } = require('node-canvas-webgl/lib')
const { Schematic } = require('prismarine-schematic')
const fs = require('fs').promises
const Vec3 = require('vec3').Vec3
const express = require('express');
const multer = require('multer');
const path = require('path');
const NBT = require('mcnbt');
const { v4: uuidv4 } = require('uuid'); // 引入 UUID 生成器
const router = express.Router();
const { Viewer, WorldView } = require('prismarine-viewer').viewer
const nbt = require('prismarine-nbt');
const zlib = require('zlib'); // 用于解压缩 .litematic 文件
const { default: v } = require('vec3')
const { Block } = require('prismarine-block')

const proceed = async (filePath, fileUUID) => {
    const viewDistance = 8
    const width = 512
    const height = 512
    const version = '1.21.4'
    const World = require('prismarine-world')(version)
    const Chunk = require('prismarine-chunk')(version)
    const center = new Vec3(30, 90, 30)
    const canvas = createCanvas(width, height)
    const renderer = new THREE.WebGLRenderer({ canvas })
    const viewer = new Viewer(renderer, false)
    const data = await fs.readFile(filePath)
    const schem = await Schematic.read(data, version)
    const world = new World(() => new Chunk())

    await schem.paste(world, new Vec3(0, 60, 0))
    
    if (!viewer.setVersion(version)) {
        throw new Error(`Failed to set viewer version to ${version}`);
    }

    // Load world
    const worldView = new WorldView(world, viewDistance, center)
    viewer.listen(worldView)

    viewer.camera.position.set(center.x, center.y, center.z)

    const point = new THREE.Vector3(0, 60, 0)

    viewer.camera.lookAt(point)

    await worldView.init(center)
    await new Promise(resolve => setTimeout(resolve, 3000))
    renderer.render(viewer.scene, viewer.camera)
    const { Blob, FileReader } = require('vblob')

    // Patch global scope to imitate browser environment.
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

    const GLTFExporter = require('three-gltf-exporter'); // Import GLTFExporter

    // Use GLTFExporter directly
    const gltfExporter = new GLTFExporter();
    await fs.writeFile(
        'uploads/gltf/' + fileUUID + '.gltf',
        await new Promise((resolve) =>
            gltfExporter.parse(viewer.scene, (result) => resolve(JSON.stringify(result)), {
                embedImages: true,
                binary: false,
            })
        )
    );

    console.log('saved')
}
const proceed_litematic = async (filePath, fileUUID) => {
    try {
        // 读取 .litematic 文件
        const data = await fs.readFile(filePath);

        // 解压缩 GZIP 数据（.litematic 文件通常是 GZIP 压缩的）
        const decompressedData = zlib.gunzipSync(data);

        // 解析 NBT 数据
        const parsed = await nbt.parse(decompressedData);
        // 获取 Metadata.EnclosingSize
        const metadata = parsed.parsed.value.Metadata.value.EnclosingSize.value;
        const BlockState = parsed.parsed.value.Regions.value;
        const BlockStateKeys = Object.keys(BlockState);

        for (const key of BlockStateKeys) { // 使用 for...of 循环
            console.log(`Region Name: ${key}`);
            const thisRegion = BlockState[key];
            const thisRegionData = thisRegion.value.BlockStates.value;
            const thisRegionPalette = thisRegion.value.BlockStatePalette.value;
            const x = Math.abs(thisRegion.value.Size.value.x.value);
            const y = Math.abs(thisRegion.value.Size.value.y.value);
            const z = Math.abs(thisRegion.value.Size.value.z.value);

            const bytesData = thisRegionData.flat().map(num => num.toString(2).padStart(32, '0')).join('');
            const byteArray = [];
            const BitsPerBlock = 8;
            for (let i = 0; i < bytesData.length; i += BitsPerBlock) {
                const byte = bytesData.slice(i, i + BitsPerBlock);
                byteArray.push(parseInt(byte, 2));
            }
            
            console.log(`Processed byteArray for ${key}, length: ${byteArray.length}`);
            
            // 构造 JSON 数据
            const jsonData = {
                fileUUID: fileUUID,
                region: key,
                status: 'success',
                timestamp: new Date().toISOString(),
                regionSize:{
                    x: x,
                    y: y,
                    z: z
                },
                blockSize: byteArray.length,
            };

            // 写入 JSON 文件
            const outputFilePath = `uploads/info/${fileUUID}-${key}.json`;
            await fs.mkdir('uploads/info', { recursive: true }); // 确保目录存在
            await fs.writeFile(outputFilePath, JSON.stringify(jsonData, null, 2));

            const viewDistance = 8
            const width = 512
            const height = 512
            const version = '1.21.4'
            const registry = require('prismarine-registry')(version)
            const BlockReg = require('prismarine-block')(registry)
            const World = require('prismarine-world')(version)
            const Chunk = require('prismarine-chunk')(version)
            const center = new Vec3(30, 90, 30)
            const canvas = createCanvas(width, height)
            const renderer = new THREE.WebGLRenderer({ canvas })
            const viewer = new Viewer(renderer, false)
            
            const world = new World(() => new Chunk())
            let pointer = 0;
            const TotX = x;
            const TotY = y;
            const TotZ = z;
            await world.initialize( async (x, y, z) => {
                pointer = y * TotX * TotZ + z * TotX + x;
                //var block = BlockReg.fromProperties(thisRegionPalette.value[byteArray[pointer]].Name.value.slice(10), {})
                var block = BlockReg.fromProperties('stone', {})
                block.skyLight = 15
                console.log(`Block: ${block.name}, X: ${x}, Y: ${y}, Z: ${z}`);
                return block
            }, z, x, y, new Vec3(0, 0, 0))

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
            await fs.writeFile(
                `uploads/gltf/${fileUUID}-${key}.gltf`,
                await new Promise((resolve) =>
                    gltfExporter.parse(viewer.scene, (result) => resolve(JSON.stringify(result)), {
                        embedImages: true,
                        binary: false
                    })
                )
            );
            console.log(`${key} GLTF saved successfully.`);
        }
    } catch (err) {
        console.error(`Error processing .litematic file: ${err.message}`);
        throw err;
    }
};

// 配置 multer 存储
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/file')); // 保存到 uploads 文件夹
    },
    filename: (req, file, cb) => {
        // 检查文件后缀是否为 .litematica 或 .schem
        const ext = path.extname(file.originalname);
        if (ext !== '.litematic' && ext !== '.schem') {
            return cb(new Error('Only .litematica and .schem files are allowed'));
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
    else if(filePath.endsWith('.schem')){
        proceed(filePath, fileUUID).then(() => {
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