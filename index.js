const { defaultStorage } = require('./storage')
const { compress } = require('./compress')
const { inflate } = require('./inflate')
const { blake2b } = require('./blake2b')
const { keygen } = require('./keygen')
const { shash } = require('./shash')
const { unbox } = require('./unbox')
const messages = require('./messages')
const { box } = require('./box')
const { kdf } = require('./kdf')

const $valueEncoding = Symbol('valueEncoding')
const $secretKey = Symbol('secretKey')
const $storage = Symbol('storage')

function update(source, storage) {
  for (const key of Object.keys(source)) {
    if (false === key in storage) {
      Object.defineProperty(storage, key, {
        configurable: true,
        enumerable: true,
        get() { return storage.getItem(key) },
        set(value) { storage.setItem(key, value) }
      })
    }
  }

  for (const key of Object.keys(storage)) {
    if (undefined === storage[key]) {
      delete storage[key]
    }
  }
}

class SecureLocalStorage {
  static get defaults() {
    return {
      secretKeyEncoding: 'hex',
      valueEncoding: messages.Node,
    }
  }

  constructor(secretKey, opts) {
    if (false === Buffer.isBuffer(secretKey) && 'object' === typeof secretKey) {
      opts = secretKey
      secret = null
    }

    if (null === opts || 'object' !== typeof opts) {
      opts = {}
    }

    opts = Object.assign(SecureLocalStorage.defaults, opts)

    if ('string' !== typeof secretKey && false === Buffer.isBuffer(secretKey)) {
      secretKey = keygen(opts.seed)
    }

    const define = (prop, value) => Object.defineProperty(this, prop, {
      configurable: true,
      enumerable: false,
      value
    })

    define($secretKey, Buffer.from(secretKey, opts.secretKeyEncoding))
    define($valueEncoding, opts.valueEncoding)

    if (opts.storage) {
      if ('function' === typeof opts.storage) {
        define($storage, opts.storage())
      } else if ('object' === typeof opts.storage) {
        define($storage, opts.storage)
      }
    } else {
      define($storage, defaultStorage)
    }

    if (null === this[$storage] || 'object' !== typeof this[$storage]) {
      throw new TypeError('Unable to determine storage.')
    }

    update(this.storage, this)
  }

  get valueEncoding() {
    return this[$valueEncoding]
  }

  set valueEncoding(valueEncoding) {
    this[$valueEncoding] = valueEncoding
  }

  get secretKey() {
    return this[$secretKey]
  }

  get storage() {
    return this[$storage]
  }

  set storage(storage) {
    this[$storage] = storage
  }

  valueOf() {
    return this.storage
  }

  toString() {
    return this.storage.toString()
  }

  toJSON() {
    if ('function' === typeof this.storage.toJSON) {
      return this.storage.toJSON()
    } else {
      return this.storage
    }
  }

  key(n) {
    if ('function' === typeof this.storage.key) {
      return this.storage.key(n)
    }
    return null
  }

  getItem(key) {
    const { valueEncoding, secretKey, storage } = this
    const original = storage.getItem(key)

    try {
      const storageKey = kdf(key, secretKey)
      const inflated = inflate(original)
      const nonce = blake2b(shash(key, secretKey), 24)
      const unboxed = unbox(storageKey, nonce, inflated)
      const value = valueEncoding.decode(unboxed)

      if (valueEncoding === messages.Node) {
        return value.value.toString()
      } else {
        return value
      }
    } catch (err) {
      return original
    }
  }

  setItem(key, value) {
    value = String(value)
    const { valueEncoding, secretKey, storage } = this
    const storageKey = kdf(key, secretKey)

    const buffer = Buffer.from(
      messages.Node === valueEncoding
      ? valueEncoding.encode({ value })
      : valueEncoding.encode(value)
    )

    const nonce = blake2b(shash(key, secretKey), 24)
    const boxed = box(storageKey, nonce, buffer)
    const compressed = compress(boxed)

    storage.setItem(key, compressed)
    update(this.storage, this)
  }

  removeItem(key) {
    return this.storage.removeItem(key)
  }

  clear() {
    return this.storage.clear()
  }
}

function createSecureLocalStorage(secretKey, opts) {
  const secureStorage = new SecureLocalStorage(secretKey, opts)

  if ('undefined' === typeof global.Proxy) {
    return secureStorage
  }

  return new Proxy(secureStorage, {
    getOwnPropertyDescriptor,
    getPrototypeOf,
    defineProperty,
    deleteProperty,
    isExtensible,
    enumerate,
    ownKeys,
    get,
    has,
    set,
  })

  function get(secureStorage, key) {
    return secureStorage[key] || secureStorage.storage[key]
  }

  function has(secureStorage, key) {
    return key in secureStorage.storage
  }

  function set(secureStorage, key, value) {
    secureStorage.setItem(key, value)
    return true
  }

  function isExtensible() {
    return true
  }

  function getOwnPropertyDescriptor(secureStorage, key) {
    const value = secureStorage.getItem(key)

    if (!value) {
      return undefined
    }

    return {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    }
  }

  function getPrototypeOf(secureStorage, key) {
    return SecureLocalStorage.prototype
  }

  function defineProperty(secureStorage, key, descriptor) {
    if ('value' in descriptor) {
      secureStorage.setItem(key, descriptor.value)
    }

    return secureStorage
  }

  function deleteProperty(secureStorage, key) {
    secureStorage.removeItem(key)
    return true
  }

  function enumerate(secureStorage) {
    return Object.keys(secureStorage.storage)
  }

  function ownKeys(secureStorage) {
    return enumerate(secureStorage)
  }
}

module.exports = Object.assign(createSecureLocalStorage, { SecureLocalStorage })
