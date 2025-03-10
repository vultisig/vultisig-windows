import { GeneralSwapProvider } from './GeneralSwapProvider'

export type GeneralSwapTx =
  | {
      evm: {
        from: string
        to: string
        data: string
        value: string
        gasPrice: string
        gas: number
      }
    }
  | {
      solana: {
        data: string
      }
    }

export type GeneralSwapQuote = {
  dstAmount: string
  provider: GeneralSwapProvider
  tx: GeneralSwapTx
}
