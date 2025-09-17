import { SwapFee } from '@core/chain/swap/SwapFee'

import { GeneralSwapProvider } from './GeneralSwapProvider'

export type GeneralSwapTx =
  | {
      evm: {
        from: string
        to: string
        data: string
        value: string
        gasPrice: string
        gas: bigint
      }
    }
  | {
      solana: {
        data: string
        networkFee: bigint
        swapFee: SwapFee
      }
    }

export type GeneralSwapQuote = {
  dstAmount: string
  provider: GeneralSwapProvider
  tx: GeneralSwapTx
}
