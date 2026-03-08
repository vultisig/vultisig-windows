const getStorageKey = (address: string): string =>
  `monero-birth-height:${address}`

export const saveBirthHeight = (address: string, height: number): void => {
  localStorage.setItem(getStorageKey(address), String(height))
}

export const loadBirthHeight = (address: string): number | null => {
  const raw = localStorage.getItem(getStorageKey(address))
  if (!raw) return null
  return Number(raw)
}
