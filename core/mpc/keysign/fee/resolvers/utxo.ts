import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { getUtxoSigningInputs } from '../../signingInputs/resolvers/utxo'
import { GetFeeAmountResolver } from '../resolver'

export const getUtxoFeeAmount: GetFeeAmountResolver = ({
  keysignPayload,
  walletCore,
  publicKey,
}) => {
  const [{ plan }] = getUtxoSigningInputs({
    keysignPayload,
    walletCore,
    publicKey,
  })

  return shouldBePresent(plan?.fee, `UTXO signing input plan fee`).toBigInt()
}
