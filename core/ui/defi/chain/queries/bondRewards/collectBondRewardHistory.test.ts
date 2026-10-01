import { range } from '@vultisig/lib-utils/array/range'
import { describe, expect, it, vi } from 'vitest'

import { BondChurn } from './churns'
import { collectBondRewardHistory } from './collectBondRewardHistory'
import { BondProviderRewards } from './providerRewards'

const bondAddress = 'thor1me'

const toChurns = (heights: number[]): BondChurn[] =>
  heights.map(height => ({ height, date: new Date(height * 1000) }))

// Churns every 100 blocks, newest first.
const churns = toChurns(range(12).map(index => 1200 - index * 100))

type RewardsByHeight = Record<number, BondProviderRewards | Error>

const mockProviderRewards = (rewardsByHeight: RewardsByHeight) =>
  vi.fn(async (height: number) => {
    const rewards = rewardsByHeight[height]
    if (rewards instanceof Error) throw rewards
    if (!rewards) throw new Error(`Unexpected height: ${height}`)

    return rewards
  })

describe('collectBondRewardHistory', () => {
  it('reads each churn one block before it, newest first', async () => {
    const getProviderRewards = mockProviderRewards({
      1199: { thor1me: 30n },
      1099: { thor1me: 20n },
      999: { thor1me: 10n },
      899: { thor1other: 5n },
    })

    const history = await collectBondRewardHistory({
      churns: churns.slice(0, 4),
      bondAddress,
      getProviderRewards,
    })

    expect(history).toEqual([
      { ...churns[0], amount: 30n },
      { ...churns[1], amount: 20n },
      { ...churns[2], amount: 10n },
    ])
  })

  it('stops at the first churn the vault was not a provider for', async () => {
    const getProviderRewards = mockProviderRewards({
      1199: { thor1me: 30n },
      1099: { thor1other: 5n },
      999: { thor1me: 10n },
      899: { thor1me: 10n },
      799: { thor1me: 10n },
      699: { thor1me: 10n },
    })

    const history = await collectBondRewardHistory({
      churns,
      bondAddress,
      getProviderRewards,
    })

    expect(history).toEqual([{ ...churns[0], amount: 30n }])
    // The first batch is already in flight, but no later batch starts.
    expect(getProviderRewards).toHaveBeenCalledTimes(5)
  })

  it('leaves out churns that paid nothing', async () => {
    const getProviderRewards = mockProviderRewards({
      1199: { thor1me: 30n },
      1099: { thor1me: 0n },
      999: {},
    })

    const history = await collectBondRewardHistory({
      churns: churns.slice(0, 3),
      bondAddress,
      getProviderRewards,
    })

    expect(history).toEqual([{ ...churns[0], amount: 30n }])
  })

  it('fails when a churn it reaches cannot be read', async () => {
    const getProviderRewards = mockProviderRewards({
      1199: { thor1me: 30n },
      1099: new Error('pruned'),
    })

    await expect(
      collectBondRewardHistory({
        churns: churns.slice(0, 2),
        bondAddress,
        getProviderRewards,
      })
    ).rejects.toThrow('pruned')
  })

  it('ignores a failed read older than the churn that ends the walk', async () => {
    const getProviderRewards = mockProviderRewards({
      1199: { thor1me: 30n },
      1099: {},
      999: new Error('pruned'),
    })

    const history = await collectBondRewardHistory({
      churns: churns.slice(0, 3),
      bondAddress,
      getProviderRewards,
    })

    expect(history).toEqual([{ ...churns[0], amount: 30n }])
  })

  it('stops before the next batch once aborted', async () => {
    const controller = new AbortController()
    const getProviderRewards = vi.fn(async () => {
      controller.abort()

      return { thor1me: 1n }
    })

    await expect(
      collectBondRewardHistory({
        churns,
        bondAddress,
        getProviderRewards,
        signal: controller.signal,
      })
    ).rejects.toThrow()
    expect(getProviderRewards).toHaveBeenCalledTimes(5)
  })
})
