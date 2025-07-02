import {
  PublicKey,
  WalletCore,
} from '@trustwallet/wallet-core/dist/src/wallet-core'

type Input = {
  publicKey: PublicKey
  walletCore: WalletCore
}

export const deriveCardanoAddress = ({ publicKey, walletCore }: Input) => {
  const extendedKeyData = publicKey.data()
  const spendingKeyData = extendedKeyData.slice(0, 32)

  const hash = walletCore.Hash.blake2b(spendingKeyData, 28)

  const addressData = new Uint8Array(29)
  addressData[0] = 0x61
  addressData.set(hash, 1)

  return walletCore.Bech32.encode('addr', addressData)
}
