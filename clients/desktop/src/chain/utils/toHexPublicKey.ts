import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'

type ToHexPublicKeyInput = {
  publicKey: PublicKey
  walletCore: WalletCore
}

export const toHexPublicKey = ({
  publicKey,
  walletCore,
}: ToHexPublicKeyInput) => {
  return stripHexPrefix(walletCore.HexCoding.encode(publicKey.data()))
}
