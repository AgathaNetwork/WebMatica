import * as THREE from 'three';
import { OrbitControls } from 'three/controls/OrbitControls';
import { GLTFLoader } from 'three/loaders/GLTFLoader';

const App = {


    AwaitStatus: function() {
        // 获取当前 URL 的查询参数
        const urlParams = new URLSearchParams(window.location.search);
        const uuid = urlParams.get('uuid'); // 获取 uuid 参数

        if (uuid) {
            console.log(`UUID: ${uuid}`);
            App.fetchStatus(uuid); // 调用 fetchStatus 函数
        } else {
            console.error('UUID 参数未找到');
            window.location.href = '/'; // 重定向到主页
        }
    },
    fetchStatus: async function(uuid) {
        const endpoint = '/status?uuid=' + uuid; // 使用 uuid 作为查询参数
        try {
            const response = await fetch(endpoint); // 发送 HTTP GET 请求
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json(); // 假设服务器返回 JSON 数据
            console.log(data);

            // 检查状态是否完成
            if (data.status === 'success') {
                    data.data.regions.forEach(async (region) => {
                    // 在页面上显示每个 region 的信息
                    // <div class="card" style="width: 18rem;">
                    // <ul class="list-group
                        await App.showDiv(uuid, region.name); // 显示每个 region 的信息
                    });
                    App.showSum(uuid); // 显示汇总信息
            }
        } catch (error) {
            console.error('请求失败:', error.message);
        }
        
    },
    downloadGLTF: function(uuid, name) {
        // 下载 glTF 文件
        const link = document.createElement('a');
        link.href = '/uploads/gltf/' + uuid + '-' + name + '.gltf';
        link.download = name + '.gltf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    downloadList: function(uuid, name) {
        window.location.href = "/exportpage?uuid=" + uuid + "&name=" + name;
    },
    showDiv: async function(uuid, name){
        // 调用API获取当前选区数据
        var data;
        const endpoint = '/region?uuid=' + uuid + '&name=' + name; // 使用 uuid 和 name 作为查询参数
        try {
            const response = await fetch(endpoint); // 发送 HTTP GET 请求
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            data = await response.json(); // 假设服务器返回 JSON 数据
            console.log(data);
            
        } catch (error) {
            console.error('请求失败:', error.message);
        }
        var xSize = data.data.metadata.x;
        var ySize = data.data.metadata.y;
        var zSize = data.data.metadata.z;
        var materialList = data.data.material_list;
        var materialHTML = "<table class=\"table table-bordered\"><thead class=\"table-light\"><tr><th scope=\"col\">名称</th><th scope=\"col\">数量</th></tr></thead><tbody>";
        materialList.forEach(material => {
            materialHTML += `<tr><td>${material.locale}</td><td>${material.count}</td></tr>`;
        })
        materialHTML += "</tbody></table>";
        // 创建一个新的 div 元素并设置其内容
        const DivElement = document.getElementById("containerDiv");
        var thisElement = document.createElement("div");
        thisElement.className = "row shadow-sm";
        thisElement.style.marginTop = "1rem";
        thisElement.style.borderRadius = "10px";
        thisElement.id = "Div_" + name;
        thisElement.innerHTML = `
            <div class="col-md-6 col-12">
            <ul class="list-group list-group-flush">
                <li class="list-group-item"><div style="display: flex; align-items: center;">
                <h3 style="margin-right: 1rem;">${name}</h3>
                <button type="button" class="btn btn-outline-primary btn-sm" onclick="App.downloadGLTF('${uuid}', '${name}');">下载glTF</button>
                <button type="button" class="btn btn-outline-primary btn-sm" style="margin-left:1rem" onclick="App.downloadList('${uuid}', '${name}');">导出材料</button>
                </div></li>
                <li class="list-group-item"><a class="text-black-50" style="margin-right:1rem;text-decoration:none">大小</a><small>x=</small>${xSize}<small>,y=</small>${ySize}<small>,z=</small>${zSize}</li>
                <li class="list-group-item" style="overflow-y: auto; max-height: 300px;">
                ` + materialHTML + `
                </li>
            </ul>
            </div>
            <div class="col-md-6 col-12" style="align-items:center;justify-content:center;display: flex" id="modelDiv_${name}">
            </div>`;
        
        DivElement.appendChild(thisElement); // 将新创建的 div 添加到页面中
        document.getElementById("modelDiv_" + name).appendChild(
            await App.createGLTFViewer("/uploads/gltf/" + uuid + "-" + name + ".gltf",
                {
                    width: 300,
                    height: 300,
                    onLoad: () => console.log('Model 2 loaded'),
                    onError: (e) => console.error('Model 2 failed:', e)
                }
            )
        );
    },
    showSum: async function(uuid){
        // 调用API获取当前选区数据
        var data;
        const endpoint = '/regionsum?uuid=' + uuid; // 使用 uuid 和 name 作为查询参数
        try {
            const response = await fetch(endpoint); // 发送 HTTP GET 请求
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            data = await response.json(); // 假设服务器返回 JSON 数据
            console.log(data);
            
        } catch (error) {
            console.error('请求失败:', error.message);
        }
        var materialList = data.data.material_sum;
        var materialHTML = "<table class=\"table table-bordered\"><thead class=\"table-light\"><tr><th scope=\"col\">名称</th><th scope=\"col\">数量</th></tr></thead><tbody>";
        materialList.forEach(material => {
            materialHTML += `<tr><td>${material.locale}</td><td>${material.count}</td></tr>`;
        })
        materialHTML += "</tbody></table>";
        document.getElementById("sumList").innerHTML = materialHTML;
        
        const WidgetDiv = document.getElementById("widgetDiv");
        WidgetDiv.innerHTML = "<button type=\"button\" class=\"btn btn-outline-primary btn-sm\" onclick=\"App.downloadList('" + uuid + "', '');\">导出材料</button><small style=\"margin-left:1rem\">将所有选区数据求和得到以下数据，即整个文件的材料</small>";
    },
    createGLTFViewer: async function (modelUrl, {
        width = 400,
        height = 400,
        onLoad = () => {},
        onError = (err) => console.error('Model load error:', err)
    }) {
        // 创建 Three.js 场景
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        // 创建透视相机
        const camera = new THREE.PerspectiveCamera(
            45, width / height, 0.25, 100
        );

        camera.position.set(0, 0, 5);

        // 创建 WebGL 渲染器
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        const canvas = renderer.domElement;

        // 添加轨道控制器
        // const controls = new THREE.OrbitControls(camera, canvas);
        const controls = new OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // 添加光源
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // 加载 glTF 模型
        // const loader = new THREE.GLTFLoader();
        const loader = new GLTFLoader();

        loader.load(
            modelUrl,
            function(gltf) {
                const model = gltf.scene;
                
                // 计算模型包围盒
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());

                model.scale.set(1, 1, 1);

                // 设置模型位置到中心
                model.position.set(-center.x, -center.y, -center.z);
                scene.add(model);


                // 自动调整相机视角
                const maxSize = Math.max(size.x, size.y, size.z);
                const fov = camera.fov * (Math.PI / 180);
                
                // 计算合适的相机距离（考虑模型高度）
                let cameraDist = maxSize / (2 * Math.sin(fov / 2)) * 1.5;
                
                // 设置相机位置（从斜上方观察）
                camera.position.set(
                    center.x + maxSize * 0.5, // 偏移避免与模型重叠
                    center.y + maxSize * 1.2, // 更高的视角
                    center.z + cameraDist
                );

                onLoad();
            },
            undefined,
            function(error) {
                onError(error);
            }
        );

        // 动画循环
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }

        animate();

        // 窗口大小变化时调整视图
        const resizeHandler = () => {
            const container = canvas.parentElement;
            if (container) {
                const rect = container.getBoundingClientRect();
                camera.aspect = rect.width / rect.height;
                camera.updateProjectionMatrix();
                renderer.setSize(rect.width, rect.height);
            }
        };

        window.addEventListener('resize', resizeHandler);

        // 返回 DOM 元素
        return canvas;
    }
}
window.App = App;