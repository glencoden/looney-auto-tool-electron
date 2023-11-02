const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    ping: () => ipcRenderer.invoke('ping'),
    ready: () => ipcRenderer.invoke('ready'),
    onLog: (callback) => ipcRenderer.on('log', (event, message) => {
        callback(message)
    }),
})