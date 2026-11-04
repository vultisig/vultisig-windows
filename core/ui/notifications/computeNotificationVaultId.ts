import { sha256 } from '@noble/hashes/sha2.js'
import { bytesToHex } from '@noble/hashes/utils.js'

type ComputeNotificationVaultIdInput = {
  ecdsaPublicKey: string
  hexChainCode: string
}

/**
 * The ID the push notification server knows a vault by: lowercase hex
 * SHA-256 of the ECDSA public key followed by the chain code, matching iOS
 * and the SDK's helper of the same name. It does not load the SDK, so the
 * extension's service worker, where `import()` is not allowed, can use it.
 */
export const computeNotificationVaultId = ({
  ecdsaPublicKey,
  hexChainCode,
}: ComputeNotificationVaultIdInput) =>
  bytesToHex(sha256(new TextEncoder().encode(ecdsaPublicKey + hexChainCode)))
