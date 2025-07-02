export type TxScanInput = {
  chain: string
  data: string
  account_address: string
  simulate_with_estimated_gas: boolean
  metadata?: {
    domain: string
  }
}

export type AddressScanInput = {
  chain: string
  address: string
}

export type ScanResponse = {
  validation?: {
    status: string
    result_type?: string
    classification?: string
    description?: string
    features?: unknown[]
    reason?: string
  }
}
