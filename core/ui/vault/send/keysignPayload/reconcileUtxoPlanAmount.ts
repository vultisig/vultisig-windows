import { BuildSendKeysignPayloadInput } from '@vultisig/core-mpc/keysign/send/build'
import { getUtxoSigningInputs } from '@vultisig/core-mpc/keysign/signingInputs/resolvers/utxo'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

type ReconcileUtxoPlanAmountInput = Pick<
  BuildSendKeysignPayloadInput,
  'publicKey' | 'walletCore'
> & {
  keysignPayload: KeysignPayload
}

/**
 * A UTXO max plan chooses its final amount after accounting for the exact
 * transaction shape and fee. Keep `toAmount` aligned with that plan so Verify,
 * signing records, and the transaction itself all describe the same amount.
 */
export const reconcileUtxoPlanAmount = async ({
  keysignPayload,
  publicKey,
  walletCore,
}: ReconcileUtxoPlanAmountInput): Promise<KeysignPayload> => {
  if (
    keysignPayload.blockchainSpecific.case !== 'utxoSpecific' ||
    !keysignPayload.blockchainSpecific.value.sendMaxAmount
  ) {
    return keysignPayload
  }

  const [signingInput] = await getUtxoSigningInputs({
    keysignPayload,
    publicKey: shouldBePresent(publicKey, 'UTXO public key'),
    walletCore,
  })
  const plannedAmount = shouldBePresent(
    signingInput?.plan?.amount,
    'UTXO signing input plan amount'
  )

  return {
    ...keysignPayload,
    toAmount: plannedAmount.toString(),
  }
}
