import { Coin } from '@core/chain/coin/Coin'

export type SolanaSwapTxData = {
  authority: string
  inputCoin: Coin
  inAmount: string
  outAmount: string
  outputCoin: Coin
  data: string
  swapProvider: string
}

export type AddressTableLookup = {
  accountKey: string
  writableIndexes: number[]
  readonlyIndexes: number[]
}
