const createSecureLocalStorage = require('../')
const test = require('tape')

test('basic', (t) => {
  const secureStorage = createSecureLocalStorage()
  secureStorage.foo = 'bar'
  t.equal('bar', secureStorage.foo)
  t.equal('bar', secureStorage.getItem('foo'))
  t.notEqual(secureStorage.foo, secureStorage.storage.getItem('foo'))

  secureStorage.storage.setItem('foo', 'bar')
  t.equal('bar', secureStorage.foo)
  t.equal('bar', secureStorage.getItem('foo'))
  t.equal(secureStorage.foo, secureStorage.storage.getItem('foo'))
  t.equal('foo', secureStorage.key(0))

  t.end()
})
