import { OtherChain } from '@vultisig/core-chain/Chain'

/** The Substrate chains whose dApp signer payloads this app accepts. */
export type SubstrateChain = OtherChain.Polkadot | OtherChain.Bittensor

/** Standard Polkadot signer payload for dApp transaction signing. */
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
}
