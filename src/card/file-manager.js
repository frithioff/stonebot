const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const request = require('request')
const winston = require('winston')

class FileManager {
    static downloadFile(uri, filename) {
        return new Promise((resolve, reject) => {
            winston.debug(`Requesting file from ${uri}`)
            mkdirp(path.dirname(filename), error => {
                if (error) { return reject(error) }

                let requestClosedClean = false
                let requestError = ''

                const writeStream = fs.createWriteStream(filename)
                writeStream.on('error', err => { fs.unlink(filename, reject.bind(null, err)) })
                writeStream.on('finish', () => {
                    if (requestClosedClean) { return resolve(filename) }
                    fs.unlink(filename, reject.bind(null, requestError))
                })

                request.get(uri)
                    .on('error', err => { requestError = err })
                    .on('response', response => {
                        if (response.statusCode === 200) { requestClosedClean = true }
                        else { requestError = `${response.statusCode} - ${response.statusMessage}` }
                    })
                    .pipe(writeStream)
                    .on('close', () => { requestClosedClean = true })
            })
        })
    }
}

module.exports = FileManager
