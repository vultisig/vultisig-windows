import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { getUtxoSigningInputs } from '../../signingInputs/resolvers/utxo'
import { GetFeeAmountResolver } from '../resolver'

export const getUtxoFeeAmount: GetFeeAmountResolver<'utxo'> = ({
  keysignPayload,
  walletCore,
  publicKey,
}) => {
  const [input] = getUtxoSigningInputs({
    keysignPayload,
    walletCore,
    publicKey,
  })

  const plan = shouldBePresent(input.plan, 'input.plan')
  const fee = shouldBePresent(plan.fee, 'input.plan.fee')

  return BigInt(fee.toString())
}
