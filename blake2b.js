const { crypto_generichash_batch } = require('sodium-universal')

function blake2b(message, key, size) {
  if (!size) {
    size = 32
  }

  const buffers = Array.isArray(message) ? message : [ Buffer.from(message) ]
  const hash = Buffer.allocUnsafe(size)

  crypto_generichash_batch(hash, buffers.map(b => Buffer.from(b)), key || null)
  return hash
}

module.exports = {
  blake2b
}
