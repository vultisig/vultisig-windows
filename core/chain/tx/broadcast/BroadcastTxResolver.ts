import { WalletCore } from '@trustwallet/wallet-core'

import { Chain } from '../../Chain'
import { DecodedTx } from '../decode'

type BroadcastTxInput<T extends Chain = Chain> = {
  chain: T
  walletCore: WalletCore
  tx: DecodedTx<T>
}

export type BroadcastTxResolver<T extends Chain = Chain> = (
  input: BroadcastTxInput<T>
) => Promise<unknown>
