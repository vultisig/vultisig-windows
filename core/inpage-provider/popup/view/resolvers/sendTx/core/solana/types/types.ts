import { Coin } from '@core/chain/coin/Coin'

export type ParsedResult =
  | {
      kind: 'swap'
      authority: string
      inputMint: string
      inAmount: string
      outAmount: string
      outputCoin: Coin
    }
  | {
      kind: 'transfer'
      authority: string
      inputMint: string
      inAmount: string
      receiverAddress: string
    }

export type AddressTableLookup = {
  accountKey: string
  writableIndexes: number[]
  readonlyIndexes: number[]
}
