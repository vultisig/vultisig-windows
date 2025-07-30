import { Tx } from '@core/chain/tx'

export type KeysignResult = { txs: Tx[] } | { signature: string }
