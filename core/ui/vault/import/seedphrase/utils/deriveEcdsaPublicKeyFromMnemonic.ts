import { WalletCore } from '@trustwallet/wallet-core'

type DeriveEcdsaPublicKeyFromMnemonicInput = {
  mnemonic: string
  walletCore: WalletCore
}

/** Derives the compressed ECDSA public key hex from a mnemonic seed phrase. */
export const deriveEcdsaPublicKeyFromMnemonic = ({
  mnemonic,
  walletCore,
}: DeriveEcdsaPublicKeyFromMnemonicInput): string => {
  const hdWallet = walletCore.HDWallet.createWithMnemonic(mnemonic, '')
  try {
    const masterKey = hdWallet.getMasterKey(walletCore.Curve.secp256k1)
    try {
      const privateKeyData = new Uint8Array(masterKey.data())
      const privateKey = walletCore.PrivateKey.createWithData(privateKeyData)
      try {
        const publicKey = privateKey.getPublicKeySecp256k1(true)
        try {
          return Buffer.from(publicKey.data()).toString('hex')
        } finally {
          publicKey.delete()
        }
      } finally {
        privateKey.delete()
      }
    } finally {
      masterKey.delete()
    }
  } finally {
    hdWallet.delete()
  }
}
