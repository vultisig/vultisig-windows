import { SwapFee } from '@core/chain/swap/SwapFee'

import { EvmFeeSettings } from '../../tx/fee/evm/EvmFeeSettings'
import { GeneralSwapProvider } from './GeneralSwapProvider'

export type GeneralSwapTx =
  | {
      evm: {
        from: string
        to: string
        data: string
        value: string
        feeQuote: Partial<EvmFeeSettings>
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
