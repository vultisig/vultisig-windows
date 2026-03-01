const getStorageKey = (zAddress: string): string =>
  `zcash-scan-height:${zAddress}`

export const saveScanHeight = (zAddress: string, height: number): void => {
  localStorage.setItem(getStorageKey(zAddress), String(height))
}

export const loadScanHeight = (zAddress: string): number | null => {
  const raw = localStorage.getItem(getStorageKey(zAddress))
  if (!raw) return null
  return Number(raw)
}
