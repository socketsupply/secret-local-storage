const {
  crypto_sign_PUBLICKEYBYTES,
  crypto_sign_SECRETKEYBYTES,
  crypto_sign_SEEDBYTES,

  crypto_sign_seed_keypair,
  randombytes_buf,
} = require('sodium-universal')

function keygen(seed) {
  if (seed && ('string' === typeof seed || Buffer.isBuffer(seed))) {
    seed = Buffer.allocUnsafe(crypto_sign_SEEDBYTES).fill(seed)
  } else {
    seed = Buffer.allocUnsafe(crypto_sign_SEEDBYTES)
    randombytes_buf(seed, crypto_sign_SEEDBYTES)
  }

  const publicKey = Buffer.allocUnsafe(crypto_sign_PUBLICKEYBYTES)
  const secretKey = Buffer.allocUnsafe(crypto_sign_SECRETKEYBYTES)

  crypto_sign_seed_keypair(publicKey, secretKey, seed)

  return secretKey.slice(0, 32)
}

module.exports = {
  keygen
}
