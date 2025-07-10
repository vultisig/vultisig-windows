export type BlockaidScanPayload = {
  chain: string
  account_address?: string
  address_account?: string
  data?: string
  transaction?: string
  encoding?: string
  transactions?: string[]
  metadata?: Record<string, unknown>
}

export type BlockaidAddressPayload = {
  chain: string
  address: string
}

export type BlockaidScanResult = {
  validation: {
    status: 'Success' | 'Failed'
    result_type: 'Benign' | 'Warning' | 'Malicious'
  }
  data?: Record<string, unknown>
}

export class BlockaidError extends Error {
  constructor(
    message: string,
    public type: 'blockaid-warning' | 'blockaid-malicious',
    public blockaid: BlockaidScanResult
  ) {
    super(message)
    this.name = 'BlockaidError'
  }
}
