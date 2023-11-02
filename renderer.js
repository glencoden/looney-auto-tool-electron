const latencyDisplay = document.getElementById('latency-display')
const loggerEntries = document.getElementById('logger-entries')

latencyDisplay.innerText = '42'

const addLoggerEntry = (innerText) => {
    const loggerEntry = document.createElement('li')

    loggerEntry.innerText = innerText

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