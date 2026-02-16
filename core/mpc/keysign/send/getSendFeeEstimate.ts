import { getFeeAmount } from '@core/mpc/keysign/fee'

import { buildSendKeysignPayload, BuildSendKeysignPayloadInput } from './build'

export const getSendFeeEstimate = async (
  input: BuildSendKeysignPayloadInput
): Promise<bigint> => {
  const keysignPayload = await buildSendKeysignPayload(input)

  return getFeeAmount({
    keysignPayload,
    walletCore: input.walletCore,
    publicKey: input.publicKey,
  })
}
