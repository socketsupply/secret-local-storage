const base58 = require('bs58')

function inflate(string, encoding) {
  return Buffer.from(base58.decode(string), encoding || 'hex')
}

module.exports = {
  inflate
}
