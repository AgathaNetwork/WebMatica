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
const proceed = async (filePath) => {
    const viewDistance = 4
    const width = 512
    const height = 512
    const version = '1.21'
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
        return false
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

    require('three/examples/js/exporters/OBJExporter')
    await fs.writeFile('model.obj', new THREE.OBJExporter().parse(viewer.scene))

    const STLExporter = require('three-stlexporter')
    await fs.writeFile('model.stl', Buffer.from(new STLExporter().parse(viewer.scene)))

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

    require('three-gltf-exporter')
    await fs.writeFile('model.gltf', await new Promise(resolve => new THREE.GLTFExporter().parse(viewer.scene, (a) => resolve(JSON.stringify(a)), {
        embedImages: true,
        binary: false
    })))
    console.log('saved')
}
// 配置 multer 存储
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads')); // 保存到 uploads 文件夹
    },
    filename: (req, file, cb) => {
        // 检查文件后缀是否为 .litematica 或 .schem
        const ext = path.extname(file.originalname);
        if (ext !== '.litematica' && ext !== '.schem') {
            return cb(new Error('Only .litematica and .schem files are allowed'));
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
    proceed(filePath).then(() => {
        console.log('File processed successfully');
    }).catch(err => {
        console.error('Error processing file:', err);
    });
});

// 其他路由
router.get('/', (req, res) => { 
    res.render('index', { title: 'Welcome to WebMatica' });
});

module.exports = router;