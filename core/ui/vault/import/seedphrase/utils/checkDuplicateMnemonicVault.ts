import { Vault } from '@core/mpc/vault/Vault'
import { clampThenUniformScalar } from '@core/mpc/utils/ed25519ScalarClamp'
import { attempt, withFallback } from '@lib/utils/attempt'
import { WalletCore } from '@trustwallet/wallet-core'

type CheckDuplicateInput = {
  mnemonic: string
  existingVaults: Vault[]
  walletCore: WalletCore
}

/**
 * Checks if a mnemonic already exists in the system by comparing
 * the derived ECDSA and EdDSA public keys against existing vault public keys
 */
export const checkDuplicateMnemonicVault = ({
  mnemonic,
  existingVaults,
  walletCore,
}: CheckDuplicateInput): Vault | null => {
  if (existingVaults.length === 0) {
    return null
  }

  const result = attempt(() => {
    const hdWallet = walletCore.HDWallet.createWithMnemonic(mnemonic, '')
    let ecdsaPrivateKey: ReturnType<typeof walletCore.PrivateKey.createWithData> | null = null
    let eddsaPrivateKey: ReturnType<typeof walletCore.PrivateKey.createWithData> | null = null

    try {
      // Derive ECDSA public key
      const ecdsaMasterKey = hdWallet.getMasterKey(walletCore.Curve.secp256k1)
      const ecdsaPrivateKeyData = new Uint8Array(ecdsaMasterKey.data())
      ecdsaPrivateKey = walletCore.PrivateKey.createWithData(ecdsaPrivateKeyData)
      const ecdsaPublicKeyData = ecdsaPrivateKey.getPublicKeySecp256k1(true).data()
      const ecdsaPublicKeyHex = Buffer.from(ecdsaPublicKeyData).toString('hex')

      // Derive EdDSA public key
      const eddtsMasterKey = hdWallet.getMasterKey(walletCore.Curve.ed25519)
      const eddsaPrivateKeyData = new Uint8Array(eddtsMasterKey.data())
      const clampedEddsaKey = clampThenUniformScalar(eddsaPrivateKeyData)
      eddsaPrivateKey = walletCore.PrivateKey.createWithData(clampedEddsaKey)
      const eddsaPublicKeyData = eddsaPrivateKey.getPublicKeyEd25519().data()
      const eddsaPublicKeyHex = Buffer.from(eddsaPublicKeyData).toString('hex')

      // Check for matching vault
      return existingVaults.find(
        vault =>
          vault.publicKeys.ecdsa === ecdsaPublicKeyHex ||
          vault.publicKeys.eddsa === eddsaPublicKeyHex
      )
    } finally {
      // Guarantee cleanup even if any step throws
      hdWallet.delete()
      ecdsaPrivateKey?.delete()
      eddsaPrivateKey?.delete()
    }
  })

  return withFallback(result, null)
}
