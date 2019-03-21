const {
  crypto_kdf_CONTEXTBYTES,
  crypto_kdf_KEYBYTES,

  crypto_kdf_derive_from_key,
} = require('sodium-universal')

function kdf(name, masterKey) {
  const key = Buffer.allocUnsafe(crypto_kdf_KEYBYTES)
  const ctx = Buffer.alloc(crypto_kdf_CONTEXTBYTES).fill(name)
  const len = name.length
  crypto_kdf_derive_from_key(key, len, ctx, masterKey)
  return key
}

module.exports = {
  kdf
}
