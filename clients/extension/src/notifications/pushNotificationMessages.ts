export const pushRegisterVaultsType = 'push_register_vaults' as const
export const pushForceRegisterVaultType = 'push_force_register_vault' as const
export const pushUnregisterVaultType = 'push_unregister_vault' as const

/** Service worker → extension UI: user tapped a Web Push keysign notification (no extension tab). */
export const openKeysignFromPushNotificationType =
  'open_keysign_from_push_notification' as const

export type VaultRegistrationInfo = {
  vaultId: string
  localPartyId: string
}

export type PushRegisterVaultsMessage = {
  type: typeof pushRegisterVaultsType
  vaults: VaultRegistrationInfo[]
}

export type PushForceRegisterVaultMessage = {
  type: typeof pushForceRegisterVaultType
  vault: VaultRegistrationInfo
}

export type PushUnregisterVaultMessage = {
  type: typeof pushUnregisterVaultType
  vault: VaultRegistrationInfo
}
