import { encodeAddress } from '@polkadot/util-crypto'
import {
  PublicKey,
  WalletCore,
} from '@trustwallet/wallet-core/dist/src/wallet-core'

type Input = {
  publicKey: PublicKey
  walletCore: WalletCore
}

const bittensorSs58Prefix = 42

export const deriveBittensorAddress = ({ publicKey }: Input) => {
  const pubKeyData = publicKey.data()
  return encodeAddress(pubKeyData, bittensorSs58Prefix)
}
