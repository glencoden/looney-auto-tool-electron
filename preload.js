const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    ping: () => ipcRenderer.invoke('ping'),
    ready: () => ipcRenderer.invoke('ready'),
    onLatencyUpdate: (callback) => ipcRenderer.on('update-latency', (event, value) => {
        callback(value)
    }),
    onLog: (callback) => ipcRenderer.on('log', (event, message) => {
        callback(message)
    }),
})