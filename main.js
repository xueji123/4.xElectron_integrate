const { app, BrowserWindow } = require("electron");
const path = require("path");

// 如果使用 Electron 9.x 及以上版本，需要将 allowRendererProcessReuse 设为 false
app.allowRendererProcessReuse = false;

function createWindow() {
    // 创建浏览器窗口
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            // preload: path.join(__dirname, "renderer.js"),
            // 将 nodeIntegration 设置 true 以及 contextIsolation 设为 false
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // 加载 index.html 文件的内容
    mainWindow.loadFile("./index.html");
    // 开启开发者工具
    mainWindow.webContents.openDevTools();
}

// 管理 Electron 应用的浏览器窗口
app.whenReady().then(() => {
    createWindow();
    // 如果当前没有窗口打开，则新建一个窗口（适用于 macOS）
    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// 如果所有窗口都已关闭，则退出 Electron 应用（适用于 Windows）
app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});