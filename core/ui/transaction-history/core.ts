import { Chain } from '@core/chain/Chain'

export const transactionRecordTypes = ['send', 'swap'] as const
export type TransactionRecordType = (typeof transactionRecordTypes)[number]

export const transactionRecordStatuses = [
  'broadcasted',
  'pending',
  'confirmed',
  'failed',
] as const
export type TransactionRecordStatus = (typeof transactionRecordStatuses)[number]

type TransactionRecordBase = {
  id: string
  vaultId: string
  type: TransactionRecordType
  status: TransactionRecordStatus
  chain: Chain
  timestamp: string
  txHash: string
  explorerUrl: string
  fiatValue: string
}

export type SendTransactionData = {
  fromAddress: string
  toAddress: string
  amount: string
  token: string
  tokenLogo: string
  tokenId?: string
  decimals: number
  feeEstimate?: string
  memo?: string
}

export type SwapTransactionData = {
  fromToken: string
  fromAmount: string
  fromChain: Chain
  fromTokenLogo: string
  fromTokenId?: string
  fromDecimals: number
  toToken: string
  toAmount: string
  toChain: Chain
  toTokenLogo: string
  toTokenId?: string
  toDecimals: number
  provider?: string
  route?: string
}

export type SendTransactionRecord = TransactionRecordBase & {
  type: 'send'
  data: SendTransactionData
}

export type SwapTransactionRecord = TransactionRecordBase & {
  type: 'swap'
  data: SwapTransactionData
}

export type TransactionRecord = SendTransactionRecord | SwapTransactionRecord

export type SerializedTransactionRecord = Omit<
  TransactionRecordBase,
  'data'
> & {
  data: string
}
