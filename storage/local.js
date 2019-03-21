const { mightHaveLocalStorage } = require('../utils')
const { MemoryStorage } = require('./memory')

module.exports = mightHaveLocalStorage
  ? global.localStorage
  : new MemoryStorage()

if (false === 'isLocalStorage' in module.exports) {
  Object.defineProperty(module.exports, 'isLocalStorage', {
    get() { return true }
  })
}
