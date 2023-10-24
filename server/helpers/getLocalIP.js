const os = require('os')

const getLocalIP = () => {
    const interfaces = os.networkInterfaces()

    for (const name of Object.keys(interfaces)) {
        for (const i of interfaces[name]) {
            const { address, family, internal } = i

            if (family === 'IPv4' && !internal) {
                return address
            }
        }
    }

    return '0.0.0.0'
}

exports.getLocalIP = getLocalIP