const version = 'v3'

export const vaultsQueryKey = ['vaults', version] as const

export const fiatCurrencyQueryKey = ['fiatCurrency', version] as const

export const currentVaultIdQueryKey = ['currentVaultId', version] as const

export const vaultsCoinsQueryKey = ['vaultsCoins', version] as const

export const defaultChainsQueryKey = ['defaultChains', version] as const

export const vaultFoldersQueryKey = ['vaultFolders', version] as const

export const addressBookItemsQueryKey = ['addressBookItems', version] as const

export const languageQueryKey = ['language', version] as const

export const isVaultBalanceVisibleQueryKey = [
  'isVaultBalanceVisible',
  version,
] as const

export const hasFinishedOnboardingQueryKey = [
  'hasFinishedOnboarding',
  version,
] as const
