//const secretStorage = require('./')('3e852b5d881b22261b8e417e217a9fa9757f4532305c4e46e2a6966aa89840f6')
const secretStorage = require('./')()

global.secretStorage = secretStorage
localStorage.setItem('hello', 'world')
console.log(secretStorage.getItem('hello')); // outputs 'hello'

secretStorage.setItem('hello', 'world')
console.log(localStorage.getItem('hello')); // should be encrypted
