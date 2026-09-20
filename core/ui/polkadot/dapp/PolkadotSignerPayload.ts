import { OtherChain } from '@vultisig/core-chain/Chain'

/** The Substrate chains whose dApp signer payloads this app accepts. */
export type SubstrateChain = OtherChain.Polkadot | OtherChain.Bittensor

/**
 * Standard Polkadot signer payload for dApp transaction signing.
 *
 * `mode` and `metadataHash` come from the `CheckMetadataHash` signed
 * extension: `mode` (0 or 1) is part of the extrinsic extra and
 * `metadataHash` is the implicit `Option<[u8;32]>` that is only ever
 * present when `mode` is 1. Both are absent on payloads produced by
 * chains without the extension.
 */
export type PolkadotSignerPayloadJSON = {
  address: string
  blockHash: string
  blockNumber: string
  era: string
  genesisHash: string
  method: string
  nonce: string
  specVersion: string
  tip: string
  transactionVersion: string
  signedExtensions: string[]
  version: number
  mode?: number
  metadataHash?: string | null
}
