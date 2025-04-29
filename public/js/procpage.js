function AwaitStatus() {
    // 获取当前 URL 的查询参数
    const urlParams = new URLSearchParams(window.location.search);
    const uuid = urlParams.get('uuid'); // 获取 uuid 参数

    if (uuid) {
        console.log(`UUID: ${uuid}`);
        // 在页面上显示 UUID 或执行其他操作
        document.querySelector('.status-desc').textContent = `正在处理，UUID: ${uuid}`;
        fetchStatus(uuid); // 调用 fetchStatus 函数
    } else {
        console.error('UUID 参数未找到');
        document.querySelector('.status-desc').textContent = 'UUID 参数未找到';
        window.location.href = '/'; // 重定向到主页
    }
}
async function fetchStatus(uuid) {
    const interval = 500;
    const endpoint = '/status?uuid=' + uuid; // 使用 uuid 作为查询参数
    while (true) {
        try {
            const response = await fetch(endpoint); // 发送 HTTP GET 请求
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json(); // 假设服务器返回 JSON 数据
            console.log(data);

            // 检查状态是否完成
            if (data.status === 'success') {
                var regions = data.data.regions; // 获取 regions 数据
                var StatusHTML = "<div class=\"card\" style=\"width: 18rem;\"><ul class=\"list-group list-group-flush\">"
                // 遍历每个 region
                var HasToDo = 0;
                regions.forEach(region => {
                    // 在页面上显示每个 region 的信息
                    // <div class="card" style="width: 18rem;">
                    // <ul class="list-group list-group-flush">
                    // <li class="list-group-item">An item</li>
                    // <li class="list-group-item">A second item</li>
                    // <li class="list-group-item">A third item</li>
                    // </ul>
                    // </div>
                    if (region.done === true) {
                        StatusHTML += `<li class="list-group-item">${region.name} <span class="badge bg-success">已完成</span></li>`;
                    }
                    else {
                        StatusHTML += `<li class="list-group-item">${region.name}</li>`;
                        HasToDo = 1; // 如果有未完成的任务，设置 HasToDo 为 1
                    }
                });
                StatusHTML += "</ul></div>";
                document.querySelector('.status-desc').innerHTML = StatusHTML; // 更新页面内容
                if(!HasToDo) {
                    window.location.href = "/detail?uuid=" + uuid; // 如果没有未完成的任务，跳转到详情页
                    break; // 退出循环
                }
            }
        } catch (error) {
            console.error('请求失败:', error.message);
            document.querySelector('.status-desc').textContent = '请求失败，请稍后重试。';
            break; // 如果请求失败，退出循环
        }

        // 等待 500 毫秒
        await new Promise(resolve => setTimeout(resolve, interval));
    }
}