import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { getSwapRecipientAddress } from '@core/ui/vault/swap/keysignPayload/getSwapRecipientAddress'
import { useSwapToCoin } from '@core/ui/vault/swap/state/toCoin'
import { getChainKind } from '@vultisig/core-chain/ChainKind'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { areLowerCaseEqual } from '@vultisig/lib-utils/string/areLowerCaseEqual'

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
  if (!recipient) {
    return null
  }

  // EVM addresses are case-insensitive (checksum vs lowercase), so compare them
  // case-insensitively; other chains use case-sensitive address formats and must
  // match exactly.
  const isOwnAddress =
    getChainKind(toCoin.chain) === 'evm'
      ? areLowerCaseEqual(recipient, toCoin.address)
      : recipient === toCoin.address

  if (isOwnAddress) {
    return null
  }

  return <SwapExternalRecipientWarning address={recipient} />
}
