import { toExactAmountString } from '../utils/exactAmountString'

export const tronWithdrawExpireUnfreezeAction =
  'withdraw_expire_unfreeze' as const

/**
 * Internal keysign marker. The TRON signer consumes it and emits a native
 * WithdrawExpireUnfreezeContract; it is never included as an on-chain memo.
 */
export const tronWithdrawExpireUnfreezeMemo = 'WITHDRAW_EXPIRE_UNFREEZE'

/** Whether a Stake 2.0 withdrawal has reached its claim timestamp. */
export const isTronWithdrawalClaimable = (
  expireTimeMs: number,
  nowMs = Date.now()
) => expireTimeMs <= nowMs

type TronUnfreezingEntry = {
  expireTimeMs: number
  unfreezeAmountSun: bigint
}

/** Exact display amount swept by one claim, without a bigint → number hop. */
export const getTronClaimableAmount = (
  entries: readonly TronUnfreezingEntry[],
  nowMs = Date.now()
) =>
  toExactAmountString(
    entries.reduce(
      (total, entry) =>
        isTronWithdrawalClaimable(entry.expireTimeMs, nowMs)
          ? total + entry.unfreezeAmountSun
          : total,
      0n
    ),
    6
  )

/** Formats the hidden claim amount for the verify screen when it is present. */
export const getTronClaimAmountDisplay = ({
  amount,
  ticker,
}: {
  amount: unknown
  ticker: string
}) =>
  typeof amount === 'string' && amount.length > 0
    ? `${amount} ${ticker}`
    : undefined

/** Exact history/progress amount from a chain-unit string. */
export const getTronClaimChainAmountDisplay = ({
  amount,
  decimals,
}: {
  amount: string
  decimals: number
}) => toExactAmountString(BigInt(amount), decimals)

/** Whether a keysign payload represents the native expired-unfreeze claim. */
export const isTronWithdrawExpireUnfreezePayload = ({
  chain,
  memo,
}: {
  chain: string
  memo?: string
}) => chain === 'Tron' && memo === tronWithdrawExpireUnfreezeMemo
