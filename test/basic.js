const createSecretLocalStorage = require('../')
const test = require('tape')

test('basic', (t) => {
  const secretStorage = createSecretLocalStorage()
  secretStorage.foo = 'bar'
  t.equal('bar', secretStorage.foo)
  t.equal('bar', secretStorage.getItem('foo'))
  t.notEqual(secretStorage.foo, secretStorage.storage.getItem('foo'))

  secretStorage.storage.setItem('foo', 'bar')
  t.equal('bar', secretStorage.foo)
  t.equal('bar', secretStorage.getItem('foo'))
  t.equal(secretStorage.foo, secretStorage.storage.getItem('foo'))
  t.equal('foo', secretStorage.key(0))

  t.end()
})
