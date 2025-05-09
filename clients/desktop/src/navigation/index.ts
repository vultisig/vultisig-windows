export const appPaths = {
  importVaultFromFile: '/vault/import/file',
  shareVault: '/vault/share',
  migrateVault: '/vault/migrate',
  vaultSettings: '/vault/settings',
  manageVaults: '/vaults/manage',
  editVault: '/vault/settings/vault-settings',
  vaultBackup: '/vault/settings/vault-settings/backup-vault',
  vaultDelete: '/vault/settings/vault-settings/delete-vault',
  checkUpdate: '/vault/settings/check-update',
  addressBook: '/vault/settings/address-book',
  faq: '/vault/settings/faq',
  vaultFAQ: '/vault/settings/faq',
  signCustomMessage: '/vault/sign-custom-message',
  registerForAirdrop: '/register-for-airdrop',
  onboarding: '/onboarding',
  createVaultFolder: '/vault/create-folder',
  vaultFolder: '/vault/folder',
  manageVaultFolder: '/vault/folder/manage',
  deeplink: '/deeplink',
  dkls: '/dkls',
} as const

type AppPaths = typeof appPaths
export type AppPath = keyof AppPaths

export type AppPathState = {
  vaultFolder: { id: string }
  manageVaultFolder: { id: string }
  deeplink: {
    url: string
  }
  importVaultFromFile: {
    filePath: string
  }
}

export type AppPathsWithState = keyof AppPathState

export type AppPathsWithoutState = Exclude<AppPath, AppPathsWithState>
