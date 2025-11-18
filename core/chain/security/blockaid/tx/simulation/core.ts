import { Coin } from '../../../../coin/Coin'

export type BlockaidSolanaSwapSimulationInfo = {
  fromMint: string
  toMint: string
  fromAmount: number
  toAmount: number
  toAssetDecimal: number
}

export type BlockaidEvmSimulationInfo =
  | {
      swap: {
        fromCoin: Coin
        fromAmount: bigint
        toCoin: Coin
        toAmount: bigint
      }
    }
  | {
      transfer: {
        fromCoin: Coin
        fromAmount: bigint
      }
    }
  | null
