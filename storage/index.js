const defaultStorage = require('./default')
const sessionStorage = require('./session')
const memoryStorage = require('./memory')
const localStorage = require('./local')

module.exports = {
  defaultStorage,
  sessionStorage,
  memoryStorage,
  localStorage,
}
