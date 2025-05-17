import { Messaging } from '../utils/interfaces'

export type Network = 'mainnet' | 'testnet'

export type Callback = (
  error: Error | null,
  result?: Messaging.Chain.Response
) => void
