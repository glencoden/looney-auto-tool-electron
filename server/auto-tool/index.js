const dgram = require('dgram')
const server = dgram.createSocket('udp4')

const PORT = 5555

// Buffer map, previously used for comparison with incoming UDP messages

// const UDP_BUFFER: { [key: string]: Uint8Array } = {
//     NOTE_START: Buffer.from('int\x00,i\x00\x00\x00\x00\x00d'),
//     NOTE_END: Buffer.from('int\x00,i\x00\x00\x00\x00\x00@'),
// }

const bindAutoToolServer = (socket, viewController) => {
    server.on('error', (err) => {
        viewController.log(`datagram server error:\n${err.stack}`)
        server.close()
    })

    let keydownEvent = null
    let keyupEvent = null

    server.on('message', (msg, _rinfo) => {
        if (keydownEvent === null) {
            keydownEvent = [ msg ]
        } else if (keydownEvent.length === 1) {
            keydownEvent.push(msg)
        } else if (keydownEvent.length === 2) {
            keydownEvent.push(msg)

            // trigger looney tool next syllable if keydown event message list is complete
            socket.send(JSON.stringify({
                name: 'next-syllable',
            }))
        } else if (keyupEvent === null) {
            keyupEvent = [ msg ]
        } else if (keyupEvent.length === 1) {
            keyupEvent.push(msg)
        } else if (keyupEvent.length === 2) {
            keyupEvent.push(msg) // redundant for now, just collect all messages

            // warn if keydown and keyup note are different
            if (Buffer.compare(keydownEvent[1], keyupEvent[1]) === 1) {
                viewController.log('WARNING: keydown and keyup note seem to not match')
            }

            keydownEvent = null
            keyupEvent = null
        }
    })

    server.bind(PORT, () => viewController.log(`datagram socket listening on port ${PORT}`))
}

exports.bindAutoToolServer = bindAutoToolServer