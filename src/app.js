const { fork } = require('child_process');

let child;
function startApp() {
    console.log('Starting app...');
    child = fork('src/main.js');
    child.on('exit', (code, signal) => {
        console.log(`App exited with code ${code}, restarting...`);
        setTimeout(startApp, 1); // 重启
    });
}
startApp();
