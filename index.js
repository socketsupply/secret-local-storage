const { defaultStorage } = require('./storage')
const { compress } = require('./compress')
const { inflate } = require('./inflate')
const { blake2b } = require('./blake2b')
const { keygen } = require('./keygen')
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

class SecretLocalStorage {
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

    opts = Object.assign(SecretLocalStorage.defaults, opts)

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
      const nonce = blake2b(key, secretKey, 24)
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

    const nonce = blake2b(key, secretKey, 24)
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

function createSecretLocalStorage(secretKey, opts) {
  const secretStorage = new SecretLocalStorage(secretKey, opts)

  if ('undefined' === typeof global.Proxy) {
    return secretStorage
  }

  return new Proxy(secretStorage, {
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

  function get(secretStorage, key) {
    return secretStorage[key] || secretStorage.storage[key]
  }

  function has(secretStorage, key) {
    return key in secretStorage.storage
  }

  function set(secretStorage, key, value) {
    secretStorage.setItem(key, value)
    return true
  }

  function isExtensible() {
    return true
  }

  function getOwnPropertyDescriptor(secretStorage, key) {
    const value = secretStorage.getItem(key)

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

  function getPrototypeOf(secretStorage, key) {
    return SecretLocalStorage.prototype
  }

  function defineProperty(secretStorage, key, descriptor) {
    if ('value' in descriptor) {
      secretStorage.setItem(key, descriptor.value)
    }

    return secretStorage
  }

  function deleteProperty(secretStorage, key) {
    secretStorage.removeItem(key)
    return true
  }

  function enumerate(secretStorage) {
    return Object.keys(secretStorage.storage)
  }

  function ownKeys(secretStorage) {
    return enumerate(secretStorage)
  }
}

module.exports = Object.assign(createSecretLocalStorage, { SecretLocalStorage })
