secret-local-storage
====================

A wrapper around 'localStorage/sessionStorage' to provide storage encryption with libsodium

## Installation

```sh
$ npm install secret-local-storage
```

## Usage

```js
const { keygen } = require('secret-local-storage/keygen')
const secretKey = keygen()
const secretStorage = require('secret-local-storage')(secretKey) // will generate key by default

secretStorage.setItem('someKey', 'some secret value')
console.log(secretStorage.getItem('someKey')) // some secret value
console.log(localStorage.getItem('someKey')) // 5J3nmcMCcABSwJN
```

## Example

```js
const secretStorage = require('secret-local-storage')('3e852b5d881b22261b8e417e217a9fa9757f4532305c4e46e2a6966aa89840f6')

localStorage.setItem('hello', 'world')
console.log(secretStorage.getItem('hello')); // outputs 'hello'

secretStorage.setItem('hello', 'world')
console.log(localStorage.getItem('hello')); // should be encrypted
```

## API

The `SecretLocalStorage` class implements the same API as the [Storage][Storage]
API.

### `const secretStorage = require('secret-local-storage')(secretKey, opts)`

Create a secret storage instance with an optional secret key and options where:

* `secretKey` is a 32-byte buffer or 64 character 'hex' encoded string. The
  encoding of the secret key can be specified with `opts.secretKeyEncoding`.
  If you do not supply a secret key, then one will be generated for you. This
  should be saved and re-used to read the encrypted values.

* `opts` is an optional object to configure the storage where:
  * `opts.secretKeyEncoding` is the encoding of the secret key
  * `opts.valueEncoding` is an object containing `encode(value)` and
    `decode(buffer)` functions.
  * `opts.seed` is an optionl seed value to generate the secret key that
    should be 32 bytes

#### `secretKey.secretKey`

A 32 byte secret key used for encryption and child key derivation.

#### `secretStorage.storage`

The [Storage][Storage] interface backing the `SecretLocalStorage` instance.

#### `secretKey.valueEncoding`

The value encoding used for encoding and ecoding value written to storage.

##### `secretKey.valueEncoding.encode(value)`

Encodes `value` into a `Buffer`

##### `secretKey.valueEncoding.decode(buffer)`

Decodes `buffer` into a value. Most likely, a string.

#### `secretStorage.key(n)`

The same API as [Storage.key()][Storage.key].

#### `secretStorage.getItem(key)`

The same API as [Storage.getItem()][Storage.getItem]. If decryption fails, this
function will return the original value found in storage.

#### `secretStorage.setItem(key)`

The same API as [Storage.setItem()][Storage.setItem].

#### `secretStorage.removeItem(key)`

The same API as [Storage.removeItem()][Storage.removeItem].

#### `secretStorage.clear(key)`

The same API as [Storage.clear()][Storage.clear].

## License

MIT


[Storage]: https://developer.mozilla.org/en-US/docs/Web/API/Storage
[Storage.key]: https://developer.mozilla.org/en-US/docs/Web/API/Storage/key
[Storage.clear]: https://developer.mozilla.org/en-US/docs/Web/API/Storage/clear
[Storage.getItem]: https://developer.mozilla.org/en-US/docs/Web/API/Storage/getItem
[Storage.setItem]: https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem
[Storage.removeItem]: https://developer.mozilla.org/en-US/docs/Web/API/Storage/removeItem
