import { getSwapRecipientAddress } from '@core/ui/vault/swap/keysignPayload/getSwapRecipientAddress'
import { getChainKind } from '@vultisig/core-chain/ChainKind'
import { getKeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapPayload'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'
import { areLowerCaseEqual } from '@vultisig/lib-utils/string/areLowerCaseEqual'

import { SwapExternalRecipientWarning } from './SwapExternalRecipientWarning'

type SwapVerifyRecipientProps = {
  keysignPayload: KeysignPayload
}

/**
 * Renders an emphasized warning when the swap output is routed to an address
 * other than the vault's own address on the destination chain. Both the
 * recipient and the vault's own destination address are read from the built
 * keysign payload (the bytes that will be signed) rather than live swap form
 * state, so the warning shows for the initiator and every co-signing joiner
 * alike. Default own-address swaps render nothing.
 */
export const SwapVerifyRecipient = ({
  keysignPayload,
}: SwapVerifyRecipientProps) => {
  const recipient = getSwapRecipientAddress(keysignPayload)
  if (!recipient) {
    return null
  }

  const swapPayload = getKeysignSwapPayload(keysignPayload)
  const toCoin = swapPayload
    ? getRecordUnionValue(swapPayload).toCoin
    : undefined

  if (toCoin) {
    const ownCoin = fromCommCoin(toCoin)
    // EVM addresses are case-insensitive (checksum vs lowercase), so compare
    // them case-insensitively; other chains use case-sensitive address formats
    // and must match exactly.
    const isOwnAddress =
      getChainKind(ownCoin.chain) === 'evm'
        ? areLowerCaseEqual(recipient, ownCoin.address)
        : recipient === ownCoin.address

    if (isOwnAddress) {
      return null
    }
  }

  return <SwapExternalRecipientWarning address={recipient} />
}
