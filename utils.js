const isBrowser = require('is-browser')

const mightHaveSessionStorage = 'undefined' !== typeof global.sessionStorage
const mightHaveLocalStorage = 'undefined' !== typeof global.localStorage

const hasSessionStorage = isBrowser && mightHaveSessionStorage
const hasLocalStorage = isBrowser && mightHaveLocalStorage

module.exports = {
  mightHaveLocalStorage,
  mightHaveSessionStorage,
  hasSessionStorage,
  hasLocalStorage,
}
