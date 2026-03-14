import { Tx } from '@core/chain/tx'

export type MoneroBalanceFinaliseResult = {
  checkedOutputs: number
  spentOutputs?: number
  unspentOutputs?: number
  balance?: string
}

export type KeysignResult =
  | { txs: Tx[] }
  | { signature: string }
  | { moneroBalanceFinalise: MoneroBalanceFinaliseResult }
