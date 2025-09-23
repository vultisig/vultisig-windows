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
      }
    }
  | {
      transfer: {
        authority: string
        inputCoin: Coin
        inAmount: string
        receiverAddress: string
      }
    }

export type AddressTableLookup = {
  accountKey: string
  writableIndexes: number[]
  readonlyIndexes: number[]
}
