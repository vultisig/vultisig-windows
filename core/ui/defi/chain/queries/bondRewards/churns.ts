import { nanosecondsInSecond } from '../../constants/time'
import { parseNumber } from '../utils/parsers'
import { bondRewardFetchWindow, bondRewardHistoryLimit } from './config'

/** A past churn: the block that paid the node award, and when it landed. */
export type BondChurn = {
  height: number
  date: Date
}

type ChurnEntry = {
  height?: string
  date?: string
}

/**
 * The churns the reward history can reach, newest first. Midgard reports a
 * churn's date in nanoseconds; entries it cannot parse are dropped.
 */
export const toRecentBondChurns = (entries: ChurnEntry[]): BondChurn[] =>
  entries
    .map(entry => ({
      height: parseNumber(entry.height),
      date: new Date((parseNumber(entry.date) / nanosecondsInSecond) * 1000),
    }))
    .filter(({ height, date }) => height > 0 && date.getTime() > 0)
    .sort((a, b) => b.height - a.height)
    .slice(0, bondRewardHistoryLimit)

type IsWithinBondRewardFetchWindowInput = {
  churn: BondChurn
  now: number
}

/** Whether the node still holds the state a churn's reward is read from. */
export const isWithinBondRewardFetchWindow = ({
  churn,
  now,
}: IsWithinBondRewardFetchWindowInput) =>
  now - churn.date.getTime() <= bondRewardFetchWindow
