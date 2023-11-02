const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const { runServer } = require('./server')

let resolveLogger = null

const loggerPromise = new Promise((resolve) => {
    resolveLogger = resolve
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

    resolveLogger({
        log: (message) => {
            mainWindow.webContents.send('log', message)
        },
    })

    // mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
    ipcMain.handle('ping', () => 'ok')

    ipcMain.handle('ready', () => {
        loggerPromise.then(runServer)

        return 'ok'
    })

    createWindow()
})

app.on('window-all-closed', () => {
    app.quit()
})