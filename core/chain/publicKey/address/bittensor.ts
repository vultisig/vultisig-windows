import { encodeAddress } from '@polkadot/util-crypto'
import {
  PublicKey,
  WalletCore,
} from '@trustwallet/wallet-core/dist/src/wallet-core'

type Input = {
  publicKey: PublicKey
  walletCore: WalletCore
}

const BITTENSOR_SS58_PREFIX = 42

export const deriveBittensorAddress = ({ publicKey }: Input) => {
  const pubKeyData = publicKey.data()
  return encodeAddress(pubKeyData, BITTENSOR_SS58_PREFIX)
}
