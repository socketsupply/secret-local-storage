const base58 = require('bs58')

function compress(buffer, encoding) {
  return base58.encode(Buffer.from(buffer, encoding || 'hex'))
}

module.exports = {
  compress
}
