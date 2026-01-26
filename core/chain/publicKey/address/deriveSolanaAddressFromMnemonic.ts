import { WalletCore } from '@trustwallet/wallet-core'

type DeriveSolanaAddressWithPhantomPathInput = {
  mnemonic: string
  walletCore: WalletCore
}

export const phantomSolanaPath = "m/44'/501'/0'/0'"

export const deriveSolanaAddressWithPhantomPath = ({
  mnemonic,
  walletCore,
}: DeriveSolanaAddressWithPhantomPathInput): string => {
  const hdWallet = walletCore.HDWallet.createWithMnemonic(mnemonic, '')

  const coinType = walletCore.CoinType.solana
  const privateKey = hdWallet.getKey(coinType, phantomSolanaPath)
  const publicKey = privateKey.getPublicKeyEd25519()
  const address = walletCore.CoinTypeExt.deriveAddressFromPublicKey(
    coinType,
    publicKey
  )

  privateKey.delete()
  publicKey.delete()
  hdWallet.delete()

  return address
}
