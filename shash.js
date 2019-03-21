const {
  crypto_shorthash_BYTES,
  crypto_shorthash,
} = require('sodium-universal')

function shash(message, secretKey) {
  const hash = Buffer.allocUnsafe(crypto_shorthash_BYTES)
  crypto_shorthash(hash, Buffer.from(message), secretKey)
  return hash
}

module.exports = {
  shash
}
