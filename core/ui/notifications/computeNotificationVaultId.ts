import type { Vault } from '@core/mpc/vault/Vault'

type ComputeNotificationVaultIdInput = {
  ecdsaPubKey: string
  hexChainCode: string
}

/**
 * Vault id for the push notification server: lowercase hex SHA-256 of
 * UTF-8 bytes of `pubKeyECDSA + hexChainCode`, matching iOS
 * `PushNotificationManager.notificationVaultId`.
 */
export const computeNotificationVaultId = async ({
  ecdsaPubKey,
  hexChainCode,
}: ComputeNotificationVaultIdInput): Promise<string> => {
  const bytes = new TextEncoder().encode(ecdsaPubKey + hexChainCode)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

type VaultLike = Pick<Vault, 'publicKeys' | 'hexChainCode'>

/**
 * Resolves the push notification server `vault_id` for a stored vault.
 */
export const getPushNotificationVaultId = async (
  vault: VaultLike
): Promise<string> =>
  computeNotificationVaultId({
    ecdsaPubKey: vault.publicKeys.ecdsa,
    hexChainCode: vault.hexChainCode,
  })
