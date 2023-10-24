const { app, BrowserWindow } = require('electron')
const { runServer } = require('./server')

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
    })

    win.loadFile('index.html')

    runServer()
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    app.quit()
})