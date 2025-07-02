import { WalletCore } from '@trustwallet/wallet-core'

import { Chain } from '../../Chain'

type ExecuteTxInput<T extends Chain = Chain> = {
  chain: T
  walletCore: WalletCore
  compiledTx: Uint8Array<ArrayBufferLike>
  account_address?: string
  rawTx?: string
  skipBlockaid?: boolean
}

export type TxResult = {
  txHash: string
  encoded?: string
  scanResult?: {
    validation?: {
      status: string
      result_type?: string
      classification?: string
      description?: string
      features?: unknown[]
      reason?: string
    }
  }
  scanUnavailable?: boolean
}
export type ExecuteTxResolver<T extends Chain = Chain> = (
  input: ExecuteTxInput<T>
) => Promise<TxResult | TxResult[]>
