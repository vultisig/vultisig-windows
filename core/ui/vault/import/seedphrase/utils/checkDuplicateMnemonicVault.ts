import { clampThenUniformScalar } from '@core/mpc/utils/ed25519ScalarClamp'
import { Vault } from '@core/mpc/vault/Vault'
import { attempt, withFallback } from '@lib/utils/attempt'
import { WalletCore } from '@trustwallet/wallet-core'

type CheckDuplicateMnemonicVaultInput = {
  mnemonic: string
  existingVaults: Vault[]
  walletCore: WalletCore
}

type PrivateKeyLike = {
  getPublicKeySecp256k1(compressed: boolean): { data(): Uint8Array }
  getPublicKeyEd25519(): { data(): Uint8Array }
  delete(): void
}

/**
 * Checks if a mnemonic already exists in the system by comparing
 * the derived ECDSA and EdDSA public keys against existing vault public keys
 */
export const checkDuplicateMnemonicVault = ({
  mnemonic,
  existingVaults,
  walletCore,
}: CheckDuplicateMnemonicVaultInput): Vault | null => {
  if (existingVaults.length === 0) {
    return null
  }

  const result = attempt(() => {
    const hdWallet = walletCore.HDWallet.createWithMnemonic(mnemonic, '')
    let ecdsaPrivateKey: PrivateKeyLike | null = null
    let eddsaPrivateKey: PrivateKeyLike | null = null

    try {
      // Derive ECDSA public key
      const ecdsaMasterKey = hdWallet.getMasterKey(walletCore.Curve.secp256k1)
      const ecdsaPrivateKeyData = new Uint8Array(ecdsaMasterKey.data())
      ecdsaPrivateKey =
        walletCore.PrivateKey.createWithData(ecdsaPrivateKeyData)
      const ecdsaPublicKey = ecdsaPrivateKey.getPublicKeySecp256k1(true)
      const ecdsaPublicKeyHex = Buffer.from(ecdsaPublicKey.data()).toString(
        'hex'
      )

      // Derive EdDSA public key
      const eddsaMasterKey = hdWallet.getMasterKey(walletCore.Curve.ed25519)
      const eddsaPrivateKeyData = new Uint8Array(eddsaMasterKey.data())
      const clampedEddsaKey = clampThenUniformScalar(eddsaPrivateKeyData)
      eddsaPrivateKey = walletCore.PrivateKey.createWithData(clampedEddsaKey)
      const eddsaPublicKeyData = eddsaPrivateKey.getPublicKeyEd25519().data()
      const eddsaPublicKeyHex = Buffer.from(eddsaPublicKeyData).toString('hex')

      // Check for matching vault
      const vault = existingVaults.find(
        (v: Vault) =>
          v.publicKeys.ecdsa === ecdsaPublicKeyHex ||
          v.publicKeys.eddsa === eddsaPublicKeyHex
      )
      return vault ?? null
    } finally {
      // Guarantee cleanup even if any step throws
      hdWallet.delete()
      ecdsaPrivateKey?.delete()
      eddsaPrivateKey?.delete()
    }
  })

  return withFallback(result, null)
}
