import { FeeQuote } from '../../../feeQuote/core'

export type EvmFeeSettings = Omit<FeeQuote<'evm'>, 'baseFeePerGas'>
