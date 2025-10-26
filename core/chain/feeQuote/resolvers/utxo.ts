import { getUtxoByteFee } from '@core/chain/chains/utxo/fee/byteFee'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { multiplyBigInt } from '@lib/utils/bigint/bigIntMultiplyByNumber'

import { getUtxoTxSigningInput } from '../../chains/utxo/tx/signingInput'
import { complexUtxoTxMultiplier } from '../../tx/fee/utxo/UtxoFeeSettings'
import { FeeQuoteResolver } from '../resolver'

export const utxoTxSize = 250n

export const getUtxoFeeQuote: FeeQuoteResolver<'utxo'> = async ({
  coin,
  isComplexTx,
}) => {
  let byteFee = await getUtxoByteFee(coin.chain)
  if (isComplexTx) {
    byteFee = multiplyBigInt(byteFee, complexUtxoTxMultiplier)
  }

  const { plan } = getUtxoTxSigningInput({})

  return {
    byteFee,
    fee: shouldBePresent(plan?.fee, 'utxo.feeQuote.fee').toBigInt(),
  }
}
