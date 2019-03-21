const { mightHaveSessionStorage } = require('../utils')
const { MemoryStorage } = require('./memory')

module.exports = mightHaveSessionStorage
  ? global.sessionStorage
  : new MemoryStorage()

if (false === 'isSessionStorage' in module.exports) {
  Object.defineProperty(module.exports, 'isSessionStorage', {
    get() { return true }
  })
}
