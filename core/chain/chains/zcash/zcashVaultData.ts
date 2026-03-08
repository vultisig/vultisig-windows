type ZcashVaultData = {
  bundle: string
  pubKeyPackage: string
  saplingExtras: string
}

let currentData: ZcashVaultData | null = null

export const setZcashVaultData = (data: ZcashVaultData | null): void => {
  currentData = data
}

export const getZcashVaultData = (): ZcashVaultData | null => currentData
