import processShim from 'process'

if (
  __IS_FIREFOX_EXTENSION_BUILD__ &&
  !Object.prototype.hasOwnProperty.call(globalThis, 'process')
) {
  Object.defineProperty(globalThis, 'process', {
    configurable: true,
    value: processShim,
  })
}
