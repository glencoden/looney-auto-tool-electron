const axios = require('axios')

class RequestService {
    baseUrl = 'http://localhost:5555'//https://staging.api.looneytunez.de'

    _post(url, data) {
        return Promise.resolve()
            .then(() => axios.post(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                data,
            }))
            .then(response => response.data)
    }

    setLooneyAPIAutoToolIP(ip) {
        return this._post(`${this.baseUrl}/live/auto_tool_server_ip`, { ip })
    }
}

const requestService = new RequestService()

module.exports = requestService