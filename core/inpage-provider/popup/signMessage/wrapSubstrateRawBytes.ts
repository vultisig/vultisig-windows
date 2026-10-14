import { OtherChain } from '@vultisig/core-chain/Chain'

/** Substrate chains whose `signRaw` data must be `<Bytes>`-wrapped. */
export const substrateRawSignChains = [
  OtherChain.Polkadot,
  OtherChain.Bittensor,
] as const

// Buffers, not Uint8Arrays: the browser Buffer polyfill's `equals` only takes
// a Buffer.
const bytesPrefix = Buffer.from('<Bytes>')
const bytesSuffix = Buffer.from('</Bytes>')

const isWrapped = (bytes: Uint8Array) => {
  const buffer = Buffer.from(bytes)

  return (
    buffer.length >= bytesPrefix.length + bytesSuffix.length &&
    buffer.subarray(0, bytesPrefix.length).equals(bytesPrefix) &&
    buffer.subarray(buffer.length - bytesSuffix.length).equals(bytesSuffix)
  )
}

/**
 * Wraps Substrate `signRaw` data in `<Bytes>…</Bytes>`, as polkadot-js does,
 * so the signature can never also be a valid extrinsic signature. Data the
 * dApp already wrapped is left as is. Unlike polkadot-js, an Ethereum-prefixed
 * message is wrapped too: that exemption is for Ethereum-type accounts, and
 * vault Substrate keys are ed25519.
 */
export const wrapSubstrateRawBytes = (bytes: Uint8Array): Uint8Array =>
  isWrapped(bytes)
    ? bytes
    : new Uint8Array([...bytesPrefix, ...bytes, ...bytesSuffix])
