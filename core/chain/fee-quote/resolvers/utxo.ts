import { UtxoChain } from '@core/chain/Chain'
import { getUtxoStats } from '@core/chain/chains/utxo/client/getUtxoStats'
import { adjustByteFee } from '@core/chain/tx/fee/utxo/adjustByteFee'

import { FeeQuoteResolver } from '../resolver'

const getByteFee = async (chain: UtxoChain) => {
  if (chain === UtxoChain.Zcash) return 1000
  const { data } = await getUtxoStats(chain)
  const raw = data.suggested_transaction_fee_per_byte_sat
  return Math.floor(raw * 2.5)
}

export const getUtxoFeeQuote: FeeQuoteResolver<'utxo'> = async ({ coin }) => {
  const chain = coin.chain as UtxoChain
  const byteFee = adjustByteFee(await getByteFee(chain), 1)
  return { byteFee: BigInt(byteFee), byteFeeMultiplier: 1 }
}
