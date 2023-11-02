const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const { runServer } = require('./server')

let resolveViewController = null

const viewControllerPromise = new Promise((resolve) => {
    resolveViewController = resolve
})

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        titleBarStyle: 'hidden',
        transparent: true,
    })

    mainWindow.loadFile('index.html')

    resolveViewController({
        log: (message) => {
            mainWindow.webContents.send('log', message)
        },
        updateLatency: (value) => {
            mainWindow.webContents.send('update-latency', value)
        },
    })

    // mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
    ipcMain.handle('ping', () => 'ok')

    ipcMain.handle('ready', () => {
        viewControllerPromise.then(runServer)

        return 'ok'
    })

    createWindow()
})

app.on('window-all-closed', () => {
    app.quit()
})