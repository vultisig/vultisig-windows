import { UtxoChain } from '@core/chain/Chain'
import { getUtxoStats } from '@core/chain/chains/utxo/client/getUtxoStats'

import { FeeQuoteResolver } from '../resolver'

const byteFeeMultiplier = (value: bigint) => (value * 25n) / 10n

const getByteFee = async (chain: UtxoChain) => {
  if (chain === UtxoChain.Zcash) return 1000n

  const {
    data: { suggested_transaction_fee_per_byte_sat },
  } = await getUtxoStats(chain)

  return byteFeeMultiplier(BigInt(suggested_transaction_fee_per_byte_sat))
}

export const getUtxoFeeQuote: FeeQuoteResolver<'utxo'> = async ({ coin }) => {
  const byteFee = await getByteFee(coin.chain)

  return { byteFee, byteFeeMultiplier: 1 }
}
