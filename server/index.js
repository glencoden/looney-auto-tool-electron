const express = require('express')
const cors = require('cors')
const { Server } = require('socket.io')
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
                            viewController.log(`error setting IP: ${response.error}`)
                            return
                        }
                        viewController.log(`exposed IP ${response.data}`)
                        exposedIP = response.data
                    })
            }

            setTimeout(pollIP, 1000 * 5)
        }

        pollIP()
    })

    let networkLatency = null

    let requestNetworkLatencyId = 0
    let requestNetworkLatencyTimeoutId = 0

    const pingIntervals = [ 1000, 500, 400, 300, 200, 100, 50, 25 ] // ms

    let pingIterationIndex = 0

    const pingLooneyTool = () => {
        io.emit('ping', {
            pingAt: Date.now(),
            requestNetworkLatencyId,
        })

        pingIterationIndex++
    }

    const requestNetworkLatency = () => {
        clearTimeout(requestNetworkLatencyTimeoutId)

        networkLatency = null
        pingIterationIndex = 0

        pingLooneyTool()
    }

    const clients = []

    const io = new Server(server, {
            cors: {
                origin: '*',
                methods: [ 'GET', 'POST' ],
            },
        },
    )

    io.on('connection', (socket) => {
        clients.push(socket)

        viewController.log(`socket connected, num clients: ${clients.length}`)

        socket.on('disconnect', () => {
            clients.splice(clients.indexOf(socket), 1)

            viewController.log(`socket disconnected, num clients: ${clients.length}`)
        })

        socket.on('latency', ({ value, requestId }) => {
            viewController.log(`request ID: ${requestId}, ms: ${value}`)

            if (requestId !== requestNetworkLatencyId) {
                return
            }

            if (pingIterationIndex === pingIntervals.length) {
                networkLatency /= pingIntervals.length

                viewController.updateLatency(Math.round(networkLatency / 10) * 10)

                requestNetworkLatencyId++

                return
            }

            if (networkLatency === null) {
                networkLatency = value
            } else {
                networkLatency += value
            }

            requestNetworkLatencyTimeoutId = setTimeout(pingLooneyTool, pingIntervals[pingIterationIndex])
        })

        requestNetworkLatency()
    })

    bindAutoToolServer(io, viewController)
}

exports.runServer = runServer