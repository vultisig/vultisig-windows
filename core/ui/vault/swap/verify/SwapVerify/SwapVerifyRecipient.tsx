import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { getSwapRecipientAddress } from '@core/ui/vault/swap/keysignPayload/getSwapRecipientAddress'
import { useSwapToCoin } from '@core/ui/vault/swap/state/toCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'

import { SwapExternalRecipientWarning } from './SwapExternalRecipientWarning'

type SwapVerifyRecipientProps = {
  keysignPayload: KeysignPayload
}

/**
 * Renders an emphasized warning when the swap output is routed to an address
 * other than the vault's own address on the destination chain. The recipient
 * is read from the built keysign payload (the bytes that will be signed).
 * Default own-address swaps render nothing.
 */
export const SwapVerifyRecipient = ({
  keysignPayload,
}: SwapVerifyRecipientProps) => {
  const [toCoinKey] = useSwapToCoin()
  const toCoin = useCurrentVaultCoin(toCoinKey)

  const recipient = getSwapRecipientAddress(keysignPayload)

  if (!recipient || recipient.toLowerCase() === toCoin.address.toLowerCase()) {
    return null
  }

  return <SwapExternalRecipientWarning address={recipient} />
}
