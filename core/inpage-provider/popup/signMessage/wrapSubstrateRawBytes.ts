import { OtherChain } from '@vultisig/core-chain/Chain'

import { endsWithBytes, startsWithBytes } from './bytes'

/** Substrate chains whose `signRaw` data must be `<Bytes>`-wrapped. */
export const substrateRawSignChains = [
  OtherChain.Polkadot,
  OtherChain.Bittensor,
] as const

const bytesPrefix = new TextEncoder().encode('<Bytes>')
const bytesSuffix = new TextEncoder().encode('</Bytes>')

const isWrapped = (bytes: Uint8Array) =>
  bytes.length >= bytesPrefix.length + bytesSuffix.length &&
  startsWithBytes({ bytes, prefix: bytesPrefix }) &&
  endsWithBytes({ bytes, suffix: bytesSuffix })

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
