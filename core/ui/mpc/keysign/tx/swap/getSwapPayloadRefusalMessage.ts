import { assertKeysignSwapSellsSigningCoin } from '@vultisig/core-mpc/keysign/swap/assertKeysignSwapSellsSigningCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { attempt } from '@vultisig/lib-utils/attempt'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'

/** Why signing is blocked when the swap payload is one the signer would refuse, otherwise undefined. */
export const getSwapPayloadRefusalMessage = (
  keysignPayload: KeysignPayload
): string | undefined => {
  const soldCoinCheck = attempt(() =>
    assertKeysignSwapSellsSigningCoin(keysignPayload)
  )
  if ('error' in soldCoinCheck) return extractErrorMsg(soldCoinCheck.error)
}
