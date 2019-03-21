class MemoryStorage extends Map {
  static create() {
    return new MemoryStorage()
  }

  static get descriptors() {
    return Object.getOwnPropertyDescriptors(MemoryStorage.prototype)
  }

  get isMemoryStorage() {
    return true
  }

  get length() {
    return [ ...this ].length
  }

  key(n) {
    return [ ...this.keys() ][n] || null
  }

  getItem(key) {
    return this.get(key)
  }

  setItem(key, value) {
    Object.defineProperty(this, key, {
      configurable: true,
      enumerable: true,
      get: () => value
    })

    this.set(String(key), String(value))
  }

  removeItem(key) {
    delete this[key]
    this.delete(key)
  }
}

module.exports = Object.defineProperties(new MemoryStorage(), {
  MemoryStorage: { get: () => MemoryStorage }
})
