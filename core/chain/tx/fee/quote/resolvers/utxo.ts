import { UtxoChain } from '../../../../Chain'
import { getUtxoStats } from '../../../../chains/utxo/client/getUtxoStats'
import { FeeQuote } from '../core'
import { FeeQuoteInput, FeeQuoteResolver } from '../resolver'

export const getUtxoFeeQuote: FeeQuoteResolver<UtxoChain> = async (
  input: FeeQuoteInput<UtxoChain>
): Promise<FeeQuote<'utxo'>> => {
  const chain = input.coin.chain as UtxoChain
  if (chain === 'Zcash') {
    return 1000n
  }
  const { data } = await getUtxoStats(chain)
  return BigInt(data.suggested_transaction_fee_per_byte_sat)
}
