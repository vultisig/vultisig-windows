/**
 * What the background rejects a bridge call with when it names a method the
 * background does not implement, such as one a later release removed. Pages
 * can post bridge messages directly, so this is reachable from any site. It
 * carries the EIP-1193 `4200` code, which `serializeBridgeError` keeps, so the
 * page reads `4200 Unsupported method` rather than the `-32603` crash from
 * calling a resolver that does not exist.
 */
export class UnsupportedMethodError extends Error {
  readonly code = 4200

  constructor(method: string) {
    super(`Unsupported method: ${method}`)
    this.name = 'UnsupportedMethodError'
  }
}
