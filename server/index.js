const express = require('express')
const cors = require('cors')
const { Server } = require('socket.io')
const { bindAutoToolServer } = require('./auto-tool')
const { getLocalIP } = require('./helpers/getLocalIP')
const requestService = require('./services/requestService')

const PORT = 5555

const runServer = () => {
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
                        console.log(response) // TODO: remove dev code
                        exposedIP = response.data
                    })
            }

            setTimeout(pollIP, 1000 * 5)
        }

        pollIP()
    })

    const io = new Server(server, {
            cors: {
                origin: '*',
                methods: [ 'GET', 'POST' ],
            },
        },
    )

    io.on('connection', (
        // socket
    ) => {
        console.log('a user connected')
    })

    bindAutoToolServer(io)
}

exports.runServer = runServer