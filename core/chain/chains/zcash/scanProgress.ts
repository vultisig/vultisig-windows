const getStorageKey = (zAddress: string): string =>
  `zcash-scan-height:${zAddress}`

const getTargetKey = (zAddress: string): string =>
  `zcash-scan-target:${zAddress}`

export const saveScanHeight = (zAddress: string, height: number): void => {
  localStorage.setItem(getStorageKey(zAddress), String(height))
}

export const loadScanHeight = (zAddress: string): number | null => {
  const raw = localStorage.getItem(getStorageKey(zAddress))
  if (!raw) return null
  return Number(raw)
}

export const clearScanHeight = (zAddress: string): void => {
  localStorage.removeItem(getStorageKey(zAddress))
}

export const saveScanTarget = (zAddress: string, height: number): void => {
  localStorage.setItem(getTargetKey(zAddress), String(height))
}

export const loadScanTarget = (zAddress: string): number | null => {
  const raw = localStorage.getItem(getTargetKey(zAddress))
  if (!raw) return null
  return Number(raw)
}

const getBirthdayScanKey = (zAddress: string): string =>
  `zcash-birthday-scan-done:${zAddress}`

export const hasBirthdayScan = (zAddress: string): boolean =>
  localStorage.getItem(getBirthdayScanKey(zAddress)) === '1'

export const markBirthdayScan = (zAddress: string): void => {
  localStorage.setItem(getBirthdayScanKey(zAddress), '1')
}
