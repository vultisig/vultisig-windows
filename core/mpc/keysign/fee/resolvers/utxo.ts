import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { getUtxoSigningInputs } from '../../signingInputs/resolvers/utxo'
import { FeeAmountResolver } from '../resolver'

export const getUtxoFeeAmount: FeeAmountResolver = input => {
  const [{ plan }] = getUtxoSigningInputs(input)

  return shouldBePresent(plan?.fee, `UTXO signing input plan fee`).toBigInt()
}
