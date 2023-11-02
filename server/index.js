const express = require('express')
const cors = require('cors')
const { Server } = require('socket.io')
const { bindAutoToolServer } = require('./auto-tool')
const { getLocalIP } = require('./helpers/getLocalIP')
const requestService = require('./services/requestService')

const PORT = 5544

const runServer = (viewController) => {
    const app = express()

    app.use(cors())

    const server = app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}.`)

        let exposedIP = null

        const pollIP = () => {
            const localIP = getLocalIP()

            if (localIP !== null && localIP !== exposedIP) {
                console.log(`expose IP ${localIP}`)

                requestService.setLooneyAPIAutoToolIP(localIP)
                    .then((response) => {
                        if (response.error !== null) {
                            console.log(response.error)
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

        socket.on('latency', (value) => {
            viewController.updateLatency(Math.round(value / 10) * 10)
        })
    })

    let pollNetworkLatencyTimeoutId = 0

    const pollNetworkLatency = () => {
        clearTimeout(pollNetworkLatencyTimeoutId)

        const pingTime = Date.now()

        io.emit('ping', pingTime)

        pollNetworkLatencyTimeoutId = setTimeout(pollNetworkLatency, 1000 * 5)
    }

    pollNetworkLatency()

    bindAutoToolServer(io)
}

exports.runServer = runServer