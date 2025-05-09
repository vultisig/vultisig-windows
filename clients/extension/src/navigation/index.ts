export const appPaths = {
  deleteVault: '/settings/vault/delete',
  onboarding: '/onboarding',
  settings: '/settings',
  vaultSettings: '/settings/vault',
  connectedDapps: '/connected-dapps',
  connectTab: '/tabs/connect',
  importTab: '/tabs/import',
  vaultsTab: '/tabs/vaults',
  transactionTab: '/tabs/transaction',
} as const

type AppPaths = typeof appPaths
export type AppPath = keyof AppPaths
