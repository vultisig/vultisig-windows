import { parseBigint, parseNumber } from '../../utils/parsers'

/** One daily TCY staking payout, in RUNE base units. */
type TcyReward = {
  date: Date
  amount: bigint
}

type TcyDistributionEntry = {
  date?: string
  amount?: string
}

/** Newest first. Midgard dates payouts in unix seconds, not the churns' nanoseconds. */
export const toTcyRewardHistory = (
  entries: TcyDistributionEntry[] | null | undefined
): TcyReward[] =>
  (entries ?? [])
    .map(entry => ({
      date: new Date(parseNumber(entry.date) * 1000),
      amount: parseBigint(entry.amount),
    }))
    .filter(({ date, amount }) => amount > 0n && date.getTime() > 0)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
