import { assertKeysignSwapSellsSigningCoin } from '@vultisig/core-mpc/keysign/swap/assertKeysignSwapSellsSigningCoin'
import { getKeysignSwapKitDepositRecipient } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapKitDepositRecipient'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { attempt } from '@vultisig/lib-utils/attempt'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { TFunction } from 'i18next'

/** Why signing is blocked when the swap payload is one the signer would refuse, otherwise undefined. */
export const getSwapPayloadRefusalMessage = (
  keysignPayload: KeysignPayload,
  t: TFunction
): string | undefined => {
  const soldCoinCheck = attempt(() =>
    assertKeysignSwapSellsSigningCoin(keysignPayload)
  )
  if ('error' in soldCoinCheck) return extractErrorMsg(soldCoinCheck.error)

  return 'error' in
    attempt(() => getKeysignSwapKitDepositRecipient(keysignPayload))
    ? `${t('swap_deposit_address')}: ${t('swap_deposit_address_unverifiable')}`
    : undefined
}
