export type { PolkadotSignerPayloadJSON } from '@core/inpage-provider/popup/view/resolvers/sendTx/core/polkadot/PolkadotSignerPayload'

export type PolkadotInjectedAccount = {
  address: string
  genesisHash?: string
  name?: string
  type?: 'ed25519' | 'sr25519' | 'ecdsa'
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
