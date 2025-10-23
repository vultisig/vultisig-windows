import { getUtxoByteFee } from '@core/chain/chains/utxo/fee/byteFee'
import { multiplyBigInt } from '@lib/utils/bigint/bigIntMultiplyByNumber'

import { complexUtxoTxMultiplier } from '../../tx/fee/utxo/UtxoFeeSettings'
import { FeeQuoteResolver } from '../resolver'

export const utxoTxSize = 250n

export const getUtxoFeeQuote: FeeQuoteResolver<'utxo'> = async ({
  coin,
  isComplexTx,
}) => {
  const byteFee = await getUtxoByteFee(coin.chain)

  return {
    byteFee: isComplexTx
      ? multiplyBigInt(byteFee, complexUtxoTxMultiplier)
      : byteFee,
    txSize: utxoTxSize,
  }
}
