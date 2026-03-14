export const process = {
  env: {},
  browser: true,
  nextTick: (fn) => setTimeout(fn, 0),
  versions: {},
  noDeprecation: true,
  pid: 0,
  argv: [],
  stderr: null,
  stdout: null,
  emitWarning: console.warn.bind(console),
}
