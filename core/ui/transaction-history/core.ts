import { Chain } from '@vultisig/core-chain/Chain'

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
  /**
   * For Cosmos SDK chains (QBTC dApp txs and in-wallet staking), the typeUrl of
   * the primary (first) message in the signed `TxBody`, e.g.
   * `/cosmos.staking.v1beta1.MsgDelegate`. Drives the history tag label so a
   * delegate/vote/claim tx isn't mislabeled as a plain "Send". Undefined for
   * non-Cosmos sends, which keep the default "Send" label.
   */
  messageTypeUrl?: string
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
  /** Present only for CowSwap RFQ orders. The orderbook API base lets the
   * status poller poll the off-chain order by UID (the record's `txHash`)
   * instead of a chain tx hash. Once the order settles, the poller replaces
   * `txHash` with the on-chain settlement hash. */
  cowSwapOrderApiBase?: string
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
