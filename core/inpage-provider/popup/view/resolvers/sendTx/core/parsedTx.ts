import { Psbt } from 'bitcoinjs-lib'

import { IKeysignTransactionPayload } from '../interfaces'
import { ParsedResult } from './solana/types/types'

export type ParsedTx =
  | {
      tx: IKeysignTransactionPayload
    }
  | {
      solanaTx: ParsedResult
    }
  | {
      psbt: Psbt
    }
