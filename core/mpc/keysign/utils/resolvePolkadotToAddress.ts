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
  const coin = getKeysignCoin(keysignPayload)
  const candidate = keysignPayload.toAddress

  if (candidate.length === 0) {
    return coin.address
  }

  const isValidDestination = isValidAddress({
    chain: coin.chain,
    address: candidate,
    walletCore,
  })

  if (!isValidDestination) {
    return coin.address
  }

  return candidate
}
