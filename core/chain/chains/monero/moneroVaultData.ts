type MoneroVaultData = {
  publicKeyEcdsa: string
  keyShare: string
}

let currentData: MoneroVaultData | null = null

export const setMoneroVaultData = (data: MoneroVaultData | null): void => {
  currentData = data
}

export const getMoneroVaultData = (): MoneroVaultData | null => currentData
