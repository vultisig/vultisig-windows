import { WalletCore } from '@trustwallet/wallet-core'

import { Chain } from '../../Chain'
import { DecodedTx } from '../decode'

type ExecuteTxInput<T extends Chain = Chain> = {
  chain: T
  walletCore: WalletCore
  tx: DecodedTx<T>
}

export type TxResult = { txHash: string; encoded?: string }
export type ExecuteTxResolver<T extends Chain = Chain> = (
  input: ExecuteTxInput<T>
) => Promise<TxResult>
