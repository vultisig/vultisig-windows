import { Coin } from '@core/chain/coin/Coin'

export type SolanaTxData =
  | {
      swap: {
        authority: string
        inputCoin: Coin
        outputCoin: Coin
        inAmount: string
        outAmount: string
        data: string
        swapProvider: string
        rawTransactions?: string[] // base64 encoded serialized transactions (one or more)
      }
    }
  | {
      transfer: {
        authority: string
        inputCoin: Coin
        inAmount: string
        receiverAddress: string
        rawTransactions?: string[] // base64 encoded serialized transactions (one or more)
      }
    }
  | {
      raw: {
        inputCoin: Coin
        inAmount: string
        transactions: string[]
      }
    }

export type AddressTableLookup = {
  accountKey: string
  writableIndexes: number[]
  readonlyIndexes: number[]
}
