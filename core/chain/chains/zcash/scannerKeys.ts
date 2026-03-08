const getKey = (zAddress: string) => `zcash-scanner-keys:${zAddress}`

type ScannerKeys = {
  pubKeyPackage: string
  saplingExtras: string
}

export const saveScannerKeys = (
  zAddress: string,
  pubKeyPackage: string,
  saplingExtras: string
): void =>
  localStorage.setItem(
    getKey(zAddress),
    JSON.stringify({ pubKeyPackage, saplingExtras })
  )

export const loadScannerKeys = (zAddress: string): ScannerKeys | null => {
  const raw = localStorage.getItem(getKey(zAddress))
  if (!raw) return null
  return JSON.parse(raw)
}
