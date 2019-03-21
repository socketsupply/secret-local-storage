const {
  crypto_secretbox_MACBYTES,
  crypto_secretbox_open_easy,
} = require('sodium-universal')

function unbox(key, nonce, ciphertext) {
  const buffer = Buffer.alloc(ciphertext.length - crypto_secretbox_MACBYTES)
  if (crypto_secretbox_open_easy(buffer, ciphertext, nonce, key)) {
    return buffer
  }

  throw new Error('Failed to decrypt ciphertext.')
}

module.exports = {
  unbox
}
