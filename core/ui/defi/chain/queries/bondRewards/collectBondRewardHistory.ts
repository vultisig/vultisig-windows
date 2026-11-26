import { toBatches } from '@vultisig/lib-utils/array/toBatches'

import { BondChurn, isWithinBondRewardFetchWindow } from './churns'
import { bondRewardHistoryBatchSize } from './config'
import { BondProviderRewards, getBondProviderReward } from './providerRewards'

/**
 * What one churn paid a bond address, in the chain's base units, or null
 * when the address was not a bond provider on the node then.
 */
export type BondChurnReading = BondChurn & {
  amount: bigint | null
}

/** What one churn paid a bond provider, in the chain's base units. */
type BondChurnReward = BondChurn & {
  amount: bigint
}

type CollectBondRewardHistoryInput = {
  churns: BondChurn[]
  savedReadings: BondChurnReading[]
  bondAddress: string
  getProviderRewards: (height: number) => Promise<BondProviderRewards>
  /**
   * Heights in `[fromHeight, toHeight)` where the address's bond on the node
   * was unbonded; no `toHeight` means up to the latest block.
   */
  getUnbondHeights: (range: {
    fromHeight: number
    toHeight?: number
  }) => Promise<number[]>
  now: number
  signal?: AbortSignal
}

type BondRewardHistory = {
  /** Newest first, up to the end of the current bond position. */
  rewards: BondChurnReward[]
  /** The churns just read from the node, to save. */
  readings: BondChurnReading[]
  /** Why the read that ended the history failed, when one did. */
  readFailure: { reason: unknown } | null
}

type FailedRead = {
  height: number
  reason: unknown
}

type HistoryEntry = BondChurnReading | FailedRead

/**
 * Churns between two entries that the device never read. A reading at a churn
 * reflects the block before it, so an unbond from `older` up to the block
 * before `newer` is inside the gap.
 */
type Gap = {
  older: number
  newer: number
}

/**
 * Reads each churn the device has not saved yet, as long as it is recent
 * enough for the node to still hold its state and newer than any saved churn
 * where the address was not a provider, one block before the churn landed
 * while the award was still on the node. Reads stop after the first batch
 * with a failure or with a churn where the address was not a provider.
 *
 * The history is the saved and the new readings together, newest first,
 * ending at the first churn where the address was not a provider, since
 * anything older belongs to another bond position, or at the first churn
 * that could not be read, since it may have been that boundary.
 *
 * Churns too old to read that were never saved leave a gap, and so does
 * anything below the oldest churn listed, where gaps cannot be seen. The
 * history bridges a gap unless the address unbonded from the node inside it,
 * checked with one unbond lookup; when that lookup fails, it ends at the gap.
 */
export const collectBondRewardHistory = async ({
  churns,
  savedReadings,
  bondAddress,
  getProviderRewards,
  getUnbondHeights,
  now,
  signal,
}: CollectBondRewardHistoryInput): Promise<BondRewardHistory> => {
  const savedHeights = new Set(savedReadings.map(({ height }) => height))
  const savedPositionStart = Math.max(
    0,
    ...savedReadings
      .filter(({ amount }) => amount === null)
      .map(({ height }) => height)
  )
  const unread = churns.filter(
    churn =>
      churn.height > savedPositionStart &&
      !savedHeights.has(churn.height) &&
      isWithinBondRewardFetchWindow({ churn, now })
  )

  const readings: BondChurnReading[] = []
  const failedReads: FailedRead[] = []

  for (const batch of toBatches(unread, bondRewardHistoryBatchSize)) {
    signal?.throwIfAborted()

    const results = await Promise.allSettled(
      batch.map(({ height }) => getProviderRewards(height - 1))
    )

    for (const [index, result] of results.entries()) {
      const churn = batch[index]

      if (result.status === 'rejected') {
        failedReads.push({ height: churn.height, reason: result.reason })
      } else {
        readings.push({
          ...churn,
          amount: getBondProviderReward({ rewards: result.value, bondAddress }),
        })
      }
    }

    if (
      failedReads.length > 0 ||
      readings.some(({ amount }) => amount === null)
    ) {
      break
    }
  }

  const newestFirst: HistoryEntry[] = [
    ...savedReadings,
    ...readings,
    ...failedReads,
  ].sort((a, b) => b.height - a.height)

  const gaps = findGaps({ churns, newestFirst })
  const ranges = [...gaps.values()]
  const toHeight = Math.max(...ranges.map(({ newer }) => newer))
  const unbondHeights =
    ranges.length === 0
      ? []
      : await getUnbondHeights({
          fromHeight: Math.min(...ranges.map(({ older }) => older)),
          toHeight: toHeight === Infinity ? undefined : toHeight,
        }).catch(() => null)

  const rewards: BondChurnReward[] = []

  for (const entry of newestFirst) {
    const gap = gaps.get(entry.height)
    const isCutAtGap =
      gap &&
      (unbondHeights === null ||
        unbondHeights.some(height => height >= gap.older && height < gap.newer))

    if (isCutAtGap) break

    if ('reason' in entry) {
      return { rewards, readings, readFailure: { reason: entry.reason } }
    }

    const { amount, ...churn } = entry

    if (amount === null) break

    rewards.push({ ...churn, amount })
  }

  return { rewards, readings, readFailure: null }
}

type FindGapsInput = {
  churns: BondChurn[]
  newestFirst: HistoryEntry[]
}

/**
 * The gap above each entry the history reaches, keyed by the entry's height:
 * a listed churn between it and the next newer entry that was never read, or
 * an entry below the oldest listed churn.
 */
const findGaps = ({ churns, newestFirst }: FindGapsInput) => {
  const knownHeights = new Set(newestFirst.map(({ height }) => height))
  const oldestListed = Math.min(...churns.map(({ height }) => height))
  const gaps = new Map<number, Gap>()
  let newer = Infinity

  for (const entry of newestFirst) {
    const older = entry.height
    const hasUnreadChurn = churns.some(
      ({ height }) =>
        height > older && height < newer && !knownHeights.has(height)
    )

    if (hasUnreadChurn || older < oldestListed) {
      gaps.set(older, { older, newer })
    }

    if ('reason' in entry || entry.amount === null) break

    newer = older
  }

  return gaps
}
