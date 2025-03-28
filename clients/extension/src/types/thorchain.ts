// THORNode types

type ThorchainChain =
  | 'BTC'
  | 'DOGE'
  | 'LTC'
  | 'BCH'
  | 'ETH'
  | 'AVAX'
  | 'BNB'
  | 'GAIA'
  | 'THOR'
  | 'BSC'
  | 'BASE'

type ThorNodeCoinSchema = {
  asset: string
  amount: string
  decimals?: number
}

type ThorNodeTx = {
  id: string
  chain: ThorchainChain
  fromAddress: string
  toAddress: string
  coins: ThorNodeCoinSchema[]
  gas: ThorNodeCoinSchema[]
  memo?: string
}

export type ThornodeTxResponseSuccess = {
  observedTx: {
    tx: ThorNodeTx
    observedPubKey?: string
    externalObservedHeight?: number
    externalConfirmationDelayHeight?: number
    aggregator?: string
    aggregatorTarget?: string
    aggregatorTargetLimit?: string
    signers?: string[]
    keysignMs?: number
    outHashes?: string[]
    status?: 'done' | 'incomplete'
  }
  consensusHeight?: number
  finalisedHeight?: number
  outboundHeight?: number
  keysignMetric?: {
    txId?: string
    nodeTssTimes: { address?: string; tssTime?: number }[]
  }
}

type ThornodeResponseError = {
  code: number
  message: string
  details: string[]
}

export type ThornodeTxResponse =
  | ThornodeTxResponseSuccess
  | ThornodeResponseError

// Provider-specific types

export type ThorchainProviderMethod =
  | 'request_accounts'
  | 'get_accounts'
  | 'send_transaction'
  | 'deposit_transaction'
  | 'get_transaction_by_hash'

type ThorchainProviderMethodToParams = {
  request_accounts: never[]
  get_accounts: never[]
  send_transaction: any[] // TODO: Request types for every method
  deposit_transaction: any[] // TODO: Request types for every method
  get_transaction_by_hash: [{ hash: string }]
}

// Generic request type based on method
export type ThorchainProviderRequest<T extends ThorchainProviderMethod> = {
  method: T
  params: ThorchainProviderMethodToParams[T]
}

export type ThorchainProviderResponse<T extends ThorchainProviderMethod> =
  T extends 'get_transaction_by_hash'
    ? ThornodeTxResponse
    : // TODO: Response types for every method
      string | string[]
