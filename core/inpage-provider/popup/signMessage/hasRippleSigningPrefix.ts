// rippled `HashPrefix` tags whose SHA-512-half digest an account key signs to
// authorize something: a single-signed transaction, a multi-signed
// transaction, a payment channel claim and a batch.
// Buffers, not Uint8Arrays: the browser Buffer polyfill's `equals` only takes
// a Buffer.
const rippleSigningPrefixes = ['STX', 'SMT', 'CLM', 'BCH'].map(tag =>
  Buffer.from(`${tag}\0`)
)

/**
 * Whether the bytes start with an XRPL signing prefix. XRPL message signing
 * signs SHA-512-half of the bytes as is, so such bytes would yield a valid
 * signature for whatever the rest of them encodes.
 */
export const hasRippleSigningPrefix = (bytes: Uint8Array): boolean =>
  rippleSigningPrefixes.some(prefix =>
    Buffer.from(bytes).subarray(0, prefix.length).equals(prefix)
  )
