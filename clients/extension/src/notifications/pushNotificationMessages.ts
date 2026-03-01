export const pushRegisterVaultsType = 'push_register_vaults' as const
export const pushForceRegisterVaultType = 'push_force_register_vault' as const

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
