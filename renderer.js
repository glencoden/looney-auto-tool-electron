const latencyDisplay = document.getElementById('latency-display')
const loggerEntries = document.getElementById('logger-entries')

const updateLatency = (value) => {
    latencyDisplay.innerText = value
}

electronAPI.onLatencyUpdate(updateLatency)

const addLoggerEntry = (message) => {
    const loggerEntry = document.createElement('li')
    const timestamp = document.createElement('span')

    loggerEntry.innerText = message
    timestamp.innerText = new Date().toLocaleTimeString('de')

    loggerEntry.prepend(timestamp)

    loggerEntries.appendChild(loggerEntry)
}

electronAPI.onLog(addLoggerEntry)
const testPing = async () => {
    const response = await electronAPI.ping()

    addLoggerEntry(`ping response: ${response}`)
}

testPing()

const onReady = async () => {
    const response = await electronAPI.ready()

    addLoggerEntry(`ready response: ${response}`)
}

window.addEventListener('DOMContentLoaded', () => {
    onReady()
})