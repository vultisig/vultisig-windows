import { Coin } from '../../../../coin/Coin'

export type BlockaidSolanaSimulationInfo =
  | {
      swap: {
        fromMint: string
        toMint: string
        fromAmount: bigint
        toAmount: bigint
        toAssetDecimal: number
      }
    }
  | {
      transfer: {
        fromMint: string
        fromAmount: bigint
      }
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
