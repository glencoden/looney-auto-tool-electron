const express = require('express')
const WebSocket = require('ws')
const cors = require('cors')
const { bindAutoToolServer } = require('./auto-tool')
const { getLocalIP } = require('./helpers/getLocalIP')
const requestService = require('./services/requestService')

const PORT = 5555

const runServer = (viewController) => {
    const app = express()

    app.use(cors())

    const server = app.listen(PORT, () => {
        viewController.log(`express server listening on port ${PORT}`)

        let exposedIP = null

        const pollIP = () => {
            const localIP = getLocalIP()

            if (localIP !== null && localIP !== exposedIP) {
                requestService.setLooneyAPIAutoToolIP(localIP)
                    .then((response) => {
                        if (response.error !== null) {
                            viewController.log(`error setting IP address: ${response.error}`)
                            return
                        }
                        viewController.log(`exposed IP address ${response.data}`)
                        exposedIP = response.data
                    })
            }

            setTimeout(pollIP, 1000 * 5)
        }

        pollIP()
    })

    let autoToolSocket = null

    let networkLatency = null

    let pingIterationIndex = 0

    const pingIntervals = [ 1000, 500, 400, 300, 200, 100, 50, 25 ] // ms

    const pingLooneyTool = () => {
        if (autoToolSocket === null) {
            return
        }

        autoToolSocket.send(performance.now())

        pingIterationIndex++
    }

    let requestNetworkLatencyTimeoutId = 0

    const requestNetworkLatency = () => {
        clearTimeout(requestNetworkLatencyTimeoutId)

        networkLatency = null
        pingIterationIndex = 0

        requestNetworkLatencyTimeoutId = setTimeout(pingLooneyTool, 1000 * 2)
    }

    const wss = new WebSocket.Server({ server })

    wss.on('connection', (socket) => {
        autoToolSocket = socket

        viewController.log('socket connected')

        socket.on('close', () => {
            viewController.log('socket disconnected')
        })

        socket.on('message', (data) => {
            const prevTimestamp = parseInt(data)

            const value = performance.now() - prevTimestamp

            viewController.log(`${Math.round(value)} ms latency`)

            if (pingIterationIndex === pingIntervals.length) {
                networkLatency /= pingIntervals.length

                // Divide by 2 to account for only half the request way (server to client) and round by factor 10
                viewController.updateLatency(Math.round((networkLatency / 2) / 10) * 10)

                return
            }

            if (networkLatency === null) {
                networkLatency = value
            } else {
                networkLatency += value
            }

            requestNetworkLatencyTimeoutId = setTimeout(pingLooneyTool, pingIntervals[pingIterationIndex])
        })

        void bindAutoToolServer(socket, viewController)

        requestNetworkLatency()
    })
}

exports.runServer = runServer