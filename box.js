const {
  crypto_secretbox_NONCEBYTES,
  crypto_secretbox_MACBYTES,

  crypto_secretbox_easy,
} = require('sodium-universal')

function box(key, nonce, buffer) {
  const length = crypto_secretbox_MACBYTES + buffer.length
  const ciphertext = Buffer.alloc(length)
  crypto_secretbox_easy(ciphertext, buffer, nonce, key)
  return ciphertext
}

module.exports = {
  box
}
