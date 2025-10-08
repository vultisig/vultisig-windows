import { EvmFeeQuote } from '@core/chain/fee-quote/core'

export type EvmFeeSettings = Omit<EvmFeeQuote, 'maxFeePerGas'> & {
  isOverride?: boolean
}
