import { FeeQuote } from '@core/chain/feeQuote/core'

import { ExtractFeeQuoteByCaseResolver } from '../resolver'

export const extractUtxoFeeQuote: ExtractFeeQuoteByCaseResolver<
  'utxoSpecific'
> = ({ value }): FeeQuote<'utxo'> => {
  return {
    byteFee: BigInt(value.byteFee),
    // txSize isn't known from payload; set 0 to leave amount calc to caller when needed
    txSize: BigInt(0),
  }
}
