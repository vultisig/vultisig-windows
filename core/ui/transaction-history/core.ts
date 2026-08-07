import { Chain } from '@vultisig/core-chain/Chain'
import { limitSwapOrderStatuses } from '@vultisig/core-chain/swap/native/limitSwapOrderStatus'

export const transactionRecordTypes = [
  'send',
  'swap',
  'limitSwap',
  'trustLine',
] as const
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
  /** Guaranteed on-chain minimum output ("min. payout"). Present only for
   * native (THORChain/MayaChain) swaps, whose signed payload carries a real
   * `to_amount_limit`. General aggregator swaps expose no separate floor. */
  toAmountLimit?: string
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

/**
 * The SDK's shared order lifecycle plus `rejected` — a deposit THORChain's
 * handler refused outright. Only visible via the cosmos tx result (a rejected
 * `MsgDeposit` never produces a Midgard action), and app-side because the
 * queue never saw the order at all.
 */
export const limitOrderTrackedStatuses = [
  ...limitSwapOrderStatuses,
  'rejected',
] as const

export type LimitOrderTrackedStatus = (typeof limitOrderTrackedStatuses)[number]

export type LimitSwapTransactionData = {
  /** The inbound tx's sender — the address the queue is polled by. */
  fromAddress: string
  fromToken: string
  fromTokenLogo: string
  fromTokenId?: string
  fromChain: Chain
  fromDecimals: number
  /** Sell amount in the source coin's smallest units. */
  fromAmount: string
  /** Buy-side ticker for display, decoded from the memo's asset notation. */
  buyTicker: string
  /** The buy asset in THORChain memo notation, as the placement memo spelt it. */
  targetAsset: string
  /** Guaranteed-minimum received, as a decimal string in buy-asset units. */
  minimumReceived: string
  destinationAddress: string
  expiryHours?: number
  /** The signed `=<` memo — the order itself; everything above derives from it. */
  memo: string
  orderStatus: LimitOrderTrackedStatus
  /**
   * Last-seen queue observation, in THORChain 1e8 fixed point. Deliberately
   * retained when the order goes terminal: the queue is the only source of the
   * fill split, and a TTL-expiry settle can follow a real partial fill —
   * dropping these on close would hide that the user received something.
   */
  deposit?: string
  amountIn?: string
  amountOut?: string
  /** Blocks until expiry at the last poll (~6s per THORChain block). */
  timeToExpiryBlocks?: number
}

export type LimitSwapTransactionRecord = TransactionRecordBase & {
  type: 'limitSwap'
  data: LimitSwapTransactionData
}

/**
 * An XRPL trust-line activation (TrustSet).
 *
 * Deliberately not a send: a TrustSet moves nothing. Its keysign amount is the
 * line's LIMIT — the ceiling the account agrees to hold — so recording it as a
 * transfer reads as an enormous outgoing payment of a token the user never
 * sent, to the issuer.
 */
export type TrustLineTransactionData = {
  fromAddress: string
  /** The issuer the line is opened with; not a payment recipient. */
  issuer: string
  token: string
  tokenLogo: string
  /** Composite `<currencyCode>.<issuer>` id of the issued currency. */
  tokenId: string
  /** The trust-line limit, in the token's smallest units. */
  limit: string
  decimals: number
}

export type TrustLineTransactionRecord = TransactionRecordBase & {
  type: 'trustLine'
  data: TrustLineTransactionData
}

export type TransactionRecord =
  | SendTransactionRecord
  | SwapTransactionRecord
  | LimitSwapTransactionRecord
  | TrustLineTransactionRecord

export type SerializedTransactionRecord = Omit<
  TransactionRecordBase,
  'data'
> & {
  data: string
}
