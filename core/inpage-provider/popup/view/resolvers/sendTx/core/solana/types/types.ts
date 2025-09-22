import { Coin } from '@core/chain/coin/Coin'

export type SolanaSwapTxData = {
  authority: string
  inputCoin: Coin
  inAmount: string
  outAmount: string
  outputCoin: Coin
}

export type AddressTableLookup = {
  accountKey: string
  writableIndexes: number[]
  readonlyIndexes: number[]
}
