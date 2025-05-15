import { Messaging } from '../utils/interfaces'

export enum NetworkKey {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
}
export type Callback = (
  error: Error | null,
  result?: Messaging.Chain.Response
) => void
