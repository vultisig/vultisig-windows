import { UtxoChain } from '../../../../Chain'
import { getUtxoStats } from '../../../../chains/utxo/client/getUtxoStats'

export const getUtxoFeeQuote = async (chain: UtxoChain) => {
  if (chain === UtxoChain.Zcash) {
    return 1000n
  }

  const { data } = await getUtxoStats(chain)
  return BigInt(data.suggested_transaction_fee_per_byte_sat)
}
