import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { WalletCore } from '@trustwallet/wallet-core'

type Input = {
  value: Uint8Array | Buffer
  walletCore: WalletCore
}

export const hexEncode = ({ value, walletCore }: Input) =>
  stripHexPrefix(walletCore.HexCoding.encode(value))
