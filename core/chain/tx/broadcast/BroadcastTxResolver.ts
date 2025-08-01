import { Chain } from '../../Chain'
import { DecodedTx } from '../decode'

type BroadcastTxInput<T extends Chain = Chain> = {
  chain: T
  tx: DecodedTx<T>
}

export type BroadcastTxResolver<T extends Chain = Chain> = (
  input: BroadcastTxInput<T>
) => Promise<unknown>
