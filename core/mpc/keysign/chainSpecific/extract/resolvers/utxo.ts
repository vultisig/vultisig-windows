import { utxoTxSize } from '@core/chain/feeQuote/resolvers/utxo'

import { ExtractFeeQuoteResolver } from '../resolver'

export const extractUtxoFeeQuote: ExtractFeeQuoteResolver<'utxoSpecific'> = ({
  byteFee,
}) => ({ byteFee: BigInt(byteFee), txSize: utxoTxSize })
