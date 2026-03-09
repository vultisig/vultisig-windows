export type PolkadotInjectedAccount = {
  address: string
  genesisHash?: string
  name?: string
  type?: 'ed25519' | 'sr25519' | 'ecdsa'
}

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

export type PolkadotSignerPayloadRaw = {
  address: string
  data: string
  type: 'bytes' | 'payload'
}

export type PolkadotSignerResult = {
  id: number
  signature: string
}
