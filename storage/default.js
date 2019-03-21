const { mightHaveLocalStorage, mightHaveSessionStorage } = require('../utils')
const sessionStorage = require('./session')
const memoryStorage = require('./memory')
const localStorage = require('./local')

module.exports = mightHaveLocalStorage ? localStorage
  : mightHaveSessionStorage ? sessionStorage
  : memoryStorage

Object.defineProperty(module.exports, 'isDefaultStorage', {
  get() { return true }
})
