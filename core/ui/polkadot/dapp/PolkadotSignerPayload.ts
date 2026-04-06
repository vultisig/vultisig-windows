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
