const getStorageKey = (zAddress: string): string =>
  `zcash-birth-height:${zAddress}`

export const saveBirthHeight = (zAddress: string, height: number): void => {
  localStorage.setItem(getStorageKey(zAddress), String(height))
}

export const loadBirthHeight = (zAddress: string): number | null => {
  const raw = localStorage.getItem(getStorageKey(zAddress))
  if (!raw) return null
  return Number(raw)
}
