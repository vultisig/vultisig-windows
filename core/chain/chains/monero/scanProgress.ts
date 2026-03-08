const getStorageKey = (address: string): string =>
  `monero-scan-height:${address}`

const getTargetKey = (address: string): string =>
  `monero-scan-target:${address}`

export const saveScanHeight = (address: string, height: number): void => {
  localStorage.setItem(getStorageKey(address), String(height))
}

export const loadScanHeight = (address: string): number | null => {
  const raw = localStorage.getItem(getStorageKey(address))
  if (!raw) return null
  return Number(raw)
}

export const clearScanHeight = (address: string): void => {
  localStorage.removeItem(getStorageKey(address))
}

export const saveScanTarget = (address: string, height: number): void => {
  localStorage.setItem(getTargetKey(address), String(height))
}

export const loadScanTarget = (address: string): number | null => {
  const raw = localStorage.getItem(getTargetKey(address))
  if (!raw) return null
  return Number(raw)
}

const getBirthdayScanKey = (address: string): string =>
  `monero-birthday-scan-done:${address}`

export const hasBirthdayScan = (address: string): boolean =>
  localStorage.getItem(getBirthdayScanKey(address)) === '1'

export const markBirthdayScan = (address: string): void => {
  localStorage.setItem(getBirthdayScanKey(address), '1')
}
