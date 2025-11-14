import { isValidAddress } from '@core/chain/utils/isValidAddress'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WalletCore } from '@trustwallet/wallet-core'

import { getKeysignCoin } from './getKeysignCoin'

type ResolvePolkadotToAddressInput = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
}

export const resolvePolkadotToAddress = ({
  keysignPayload,
  walletCore,
}: ResolvePolkadotToAddressInput): string => {
  const { toAddress } = keysignPayload
  const { chain, address } = getKeysignCoin(keysignPayload)

  const shouldUseOriginalAddress =
    toAddress &&
    isValidAddress({
      chain,
      address: toAddress,
      walletCore,
    })

  return shouldUseOriginalAddress ? toAddress : address
}
