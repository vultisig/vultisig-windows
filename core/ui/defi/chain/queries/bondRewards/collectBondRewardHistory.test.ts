import { Chain } from '@vultisig/core-chain/Chain'
import { range } from '@vultisig/lib-utils/array/range'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'
import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'
import { describe, expect, it, vi } from 'vitest'

import { fetchBondUnbondHeights } from './bondUnbonds'
import { BondChurn } from './churns'
import {
  BondChurnReading,
  collectBondRewardHistory,
} from './collectBondRewardHistory'
import { BondProviderRewards } from './providerRewards'

vi.mock('@vultisig/lib-utils/query/queryUrl', () => ({ queryUrl: vi.fn() }))

const bondAddress = 'thor1me'
const nodeAddress = 'thor1node'
const now = Date.UTC(2026, 10, 25)
const day = convertDuration(1, 'd', 'ms')

// Churns every 100 blocks, newest first, the newest one `startDay` days ago.
const toChurns = (
  count: number,
  daysApart: number,
  startDay = 0
): BondChurn[] =>
  range(count).map(index => ({
    height: 1200 - index * 100,
    date: new Date(now - (startDay + index * daysApart) * day),
  }))

// Twelve churns a day apart: all inside the fetch window.
const churns = toChurns(12, 1)

type RewardsByHeight = Record<number, BondProviderRewards | Error>

const mockProviderRewards = (rewardsByHeight: RewardsByHeight) =>
  vi.fn(async (height: number) => {
    const rewards = rewardsByHeight[height]
    if (rewards instanceof Error) throw rewards
    if (!rewards) throw new Error(`Unexpected height: ${height}`)

    return rewards
  })

const collect = (
  input: Pick<
    Parameters<typeof collectBondRewardHistory>[0],
    'churns' | 'getProviderRewards'
  > &
    Partial<
      Pick<
        Parameters<typeof collectBondRewardHistory>[0],
        'savedReadings' | 'getUnbondHeights' | 'signal'
      >
    >
) =>
  collectBondRewardHistory({
    bondAddress,
    now,
    savedReadings: [],
    getUnbondHeights: async () => [],
    ...input,
  })

describe('collectBondRewardHistory', () => {
  it('reads each churn one block before it, newest first', async () => {
    const getProviderRewards = mockProviderRewards({
      1199: { thor1me: 30n },
      1099: { thor1me: 20n },
      999: { thor1me: 10n },
      899: { thor1other: 5n },
    })

    const { rewards, readings } = await collect({
      churns: churns.slice(0, 4),
      getProviderRewards,
    })

    expect(rewards).toEqual([
      { ...churns[0], amount: 30n },
      { ...churns[1], amount: 20n },
      { ...churns[2], amount: 10n },
    ])
    expect(readings).toEqual([...rewards, { ...churns[3], amount: null }])
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

    const { rewards } = await collect({ churns, getProviderRewards })

    expect(rewards).toEqual([{ ...churns[0], amount: 30n }])
    // The first batch is already in flight, but no later batch starts.
    expect(getProviderRewards).toHaveBeenCalledTimes(5)
  })

  it('keeps churns that paid nothing, so they are saved too', async () => {
    const getProviderRewards = mockProviderRewards({
      1199: { thor1me: 30n },
      1099: { thor1me: 0n },
      999: {},
    })

    const { rewards } = await collect({
      churns: churns.slice(0, 3),
      getProviderRewards,
    })

    expect(rewards).toEqual([
      { ...churns[0], amount: 30n },
      { ...churns[1], amount: 0n },
    ])
  })

  it('never reads a churn older than the fetch window', async () => {
    // Five days apart: churns at 0, 5 and 10 days are readable, 15 and 20 are not.
    const spaced = toChurns(5, 5)
    const getProviderRewards = mockProviderRewards({
      1199: { thor1me: 30n },
      1099: { thor1me: 20n },
      999: { thor1me: 10n },
    })

    const { rewards } = await collect({ churns: spaced, getProviderRewards })

    expect(getProviderRewards.mock.calls).toEqual([[1199], [1099], [999]])
    expect(rewards.map(({ height }) => height)).toEqual([1200, 1100, 1000])
  })

  it('shows saved churns older than the window with new ones, newest first, once each', async () => {
    const spaced = toChurns(3, 10)
    const getProviderRewards = mockProviderRewards({
      1199: { thor1me: 30n },
    })
    const savedReadings: BondChurnReading[] = [
      { ...spaced[1], amount: 20n },
      { ...spaced[2], amount: 10n },
      { height: 100, date: new Date(now - 200 * day), amount: 5n },
    ]

    const { rewards, readings } = await collect({
      churns: spaced,
      savedReadings,
      getProviderRewards,
    })

    expect(rewards).toEqual([{ ...spaced[0], amount: 30n }, ...savedReadings])
    expect(readings).toEqual([{ ...spaced[0], amount: 30n }])
  })

  it('does not read a saved churn again', async () => {
    const getProviderRewards = mockProviderRewards({
      1199: { thor1me: 30n },
      899: {},
    })

    const { rewards } = await collect({
      churns: churns.slice(0, 4),
      savedReadings: [
        { ...churns[1], amount: 20n },
        { ...churns[2], amount: 0n },
      ],
      getProviderRewards,
    })

    expect(getProviderRewards.mock.calls).toEqual([[1199], [899]])
    expect(rewards).toEqual([
      { ...churns[0], amount: 30n },
      { ...churns[1], amount: 20n },
      { ...churns[2], amount: 0n },
    ])
  })

  it('ends the history at a saved churn the vault was not a provider for', async () => {
    const getProviderRewards = mockProviderRewards({
      1199: { thor1me: 30n },
    })

    const { rewards } = await collect({
      churns: churns.slice(0, 1),
      savedReadings: [
        { ...churns[1], amount: null },
        { ...churns[2], amount: 10n },
      ],
      getProviderRewards,
    })

    expect(rewards).toEqual([{ ...churns[0], amount: 30n }])
  })

  it('ends the history at the first churn it cannot read, saved rows below included', async () => {
    const getProviderRewards = mockProviderRewards({
      1199: { thor1me: 30n },
      1099: new Error('pruned'),
      999: { thor1me: 10n },
      899: { thor1me: 10n },
      799: { thor1me: 10n },
    })

    const { rewards, readings, readFailure } = await collect({
      churns,
      savedReadings: [
        { height: 100, date: new Date(now - 60 * day), amount: 5n },
      ],
      getProviderRewards,
    })

    // The unread churn may be where the vault left an earlier position.
    expect(rewards).toEqual([{ ...churns[0], amount: 30n }])
    expect(readFailure).toEqual({ reason: new Error('pruned') })
    expect(readings.map(({ height }) => height)).toEqual([1200, 1000, 900, 800])
    expect(getProviderRewards).toHaveBeenCalledTimes(5)
  })

  it('shows nothing when the newest churn cannot be read, even with saved churns below it', async () => {
    const getProviderRewards = mockProviderRewards({
      1199: new Error('pruned'),
    })

    const { rewards, readFailure } = await collect({
      churns: churns.slice(0, 2),
      savedReadings: [{ ...churns[1], amount: 20n }],
      getProviderRewards,
    })

    expect(rewards).toEqual([])
    expect(readFailure).toEqual({ reason: new Error('pruned') })
  })

  it('reports a failed read with the readings to save, even with nothing to show', async () => {
    const getProviderRewards = mockProviderRewards({
      1199: new Error('pruned'),
      1099: {},
    })

    const { rewards, readings, readFailure } = await collect({
      churns: churns.slice(0, 2),
      getProviderRewards,
    })

    expect(rewards).toEqual([])
    expect(readings).toEqual([{ ...churns[1], amount: null }])
    expect(readFailure).toEqual({ reason: new Error('pruned') })
  })

  it('ignores a failed read below the churn that ended the position', async () => {
    const getProviderRewards = mockProviderRewards({
      1199: {},
      1099: new Error('pruned'),
    })

    const { rewards, readFailure } = await collect({
      churns: churns.slice(0, 2),
      getProviderRewards,
    })

    expect(rewards).toEqual([])
    expect(readFailure).toBeNull()
  })

  it('does not read churns older than a saved churn the vault was not a provider for', async () => {
    const getProviderRewards = mockProviderRewards({
      1199: { thor1me: 30n },
    })

    await collect({
      churns: churns.slice(0, 5),
      savedReadings: [{ ...churns[1], amount: null }],
      getProviderRewards,
    })

    expect(getProviderRewards.mock.calls).toEqual([[1199]])
  })

  it('ignores a failed read older than the churn that ends the history', async () => {
    const getProviderRewards = mockProviderRewards({
      1199: { thor1me: 30n },
      1099: {},
      999: new Error('pruned'),
    })

    const { rewards } = await collect({
      churns: churns.slice(0, 3),
      getProviderRewards,
    })

    expect(rewards).toEqual([{ ...churns[0], amount: 30n }])
  })

  it('stops before the next batch once aborted', async () => {
    const controller = new AbortController()
    const getProviderRewards = vi.fn(async () => {
      controller.abort()

      return { thor1me: 1n }
    })

    await expect(
      collect({ churns, getProviderRewards, signal: controller.signal })
    ).rejects.toThrow()
    expect(getProviderRewards).toHaveBeenCalledTimes(5)
  })

  describe('a gap of churns too old to read that were never saved', () => {
    // Read: 1200 (today) and 1100 (10 days). Gap: 1000 (20 days). Saved: 900 (30 days).
    const spaced = toChurns(4, 10)
    const getProviderRewards = () =>
      mockProviderRewards({ 1199: { thor1me: 30n }, 1099: { thor1me: 20n } })
    const savedReadings = [{ ...spaced[3], amount: 10n }]

    it('is bridged when the address did not unbond from the node in it', async () => {
      const getUnbondHeights = vi.fn(async () => [1100, 899])

      const { rewards } = await collect({
        churns: spaced,
        savedReadings,
        getProviderRewards: getProviderRewards(),
        getUnbondHeights,
      })

      expect(rewards.map(({ height }) => height)).toEqual([1200, 1100, 900])
      expect(getUnbondHeights.mock.calls).toEqual([
        [{ fromHeight: 900, toHeight: 1100 }],
      ])
    })

    it('ends the history when the address unbonded from the node in it', async () => {
      const { rewards, readFailure } = await collect({
        churns: spaced,
        savedReadings,
        getProviderRewards: getProviderRewards(),
        getUnbondHeights: async () => [1050],
      })

      expect(rewards.map(({ height }) => height)).toEqual([1200, 1100])
      expect(readFailure).toBeNull()
    })

    it('ends the history when the unbond is in the block of the older churn', async () => {
      const { rewards } = await collect({
        churns: spaced,
        savedReadings,
        getProviderRewards: getProviderRewards(),
        getUnbondHeights: async () => [900],
      })

      expect(rewards.map(({ height }) => height)).toEqual([1200, 1100])
    })

    const midgardUrl =
      'https://gateway.liquify.com/chain/thorchain_midgard/v2/actions?address=thor1node&type=unbond&fromHeight=900&height=1100&limit=50'

    const collectThroughMidgard = async (
      actions: { height: string; memo: string; sender: string }[]
    ) => {
      vi.mocked(queryUrl).mockResolvedValueOnce({
        actions: actions.map(({ height, memo, sender }) => ({
          height,
          in: [{ address: sender }],
          metadata: { bond: { memo, nodeAddress } },
        })),
      })

      const { rewards } = await collect({
        churns: spaced,
        savedReadings,
        getProviderRewards: getProviderRewards(),
        getUnbondHeights: range =>
          fetchBondUnbondHeights({
            chain: Chain.THORChain,
            bondAddress,
            nodeAddress,
            ...range,
          }),
      })

      expect(vi.mocked(queryUrl).mock.lastCall).toEqual([midgardUrl])

      return rewards.map(({ height }) => height)
    }

    it('ends the history when the operator unbonded this provider in it', async () => {
      const heights = await collectThroughMidgard([
        {
          height: '1000',
          memo: 'UNBOND:thor1node:5:thor1me',
          sender: 'thor1operator',
        },
      ])

      expect(heights).toEqual([1200, 1100])
    })

    it('is bridged when another provider unbonded in it', async () => {
      const heights = await collectThroughMidgard([
        { height: '1000', memo: 'UNBOND:thor1node:5', sender: 'thor1other' },
      ])

      expect(heights).toEqual([1200, 1100, 900])
    })

    it('is bridged when this address unbonded another provider as operator', async () => {
      const heights = await collectThroughMidgard([
        {
          height: '1000',
          memo: 'UNBOND:thor1node:5:thor1other',
          sender: bondAddress,
        },
      ])

      expect(heights).toEqual([1200, 1100, 900])
    })

    it('ends the history when the memo names this provider in upper case', async () => {
      const heights = await collectThroughMidgard([
        {
          height: '1000',
          memo: 'UNBOND:thor1node:5:THOR1ME',
          sender: 'thor1operator',
        },
      ])

      expect(heights).toEqual([1200, 1100])
    })

    it('ends the history without an error when the unbond lookup fails', async () => {
      const { rewards, readFailure } = await collect({
        churns: spaced,
        savedReadings,
        getProviderRewards: getProviderRewards(),
        getUnbondHeights: async () => {
          throw new Error('midgard down')
        },
      })

      expect(rewards.map(({ height }) => height)).toEqual([1200, 1100])
      expect(readFailure).toBeNull()
    })
  })
})

describe('fetchBondUnbondHeights on MayaChain', () => {
  const mayaNode = 'maya1node'
  const mayaProvider = 'maya1me'

  const fetchMaya = (memo: string, sender: string) => {
    vi.mocked(queryUrl).mockResolvedValueOnce({
      actions: [
        {
          height: '500',
          in: [{ address: sender }],
          metadata: { bond: { memo, nodeAddress: mayaNode } },
        },
      ],
    })

    return fetchBondUnbondHeights({
      chain: Chain.MayaChain,
      bondAddress: mayaProvider,
      nodeAddress: mayaNode,
      fromHeight: 400,
    })
  }

  it('reads the provider from the field after the node address', async () => {
    expect(
      await fetchMaya('UNBOND:::maya1node:maya1me', 'maya1operator')
    ).toEqual([500])
    expect(vi.mocked(queryUrl).mock.lastCall).toEqual([
      'https://midgard.mayachain.info/v2/actions?address=maya1node&type=unbond&fromHeight=400&limit=50',
    ])
  })

  it('reads the provider named right after the node in the older memo layout', async () => {
    expect(await fetchMaya('UNBOND:maya1node:maya1me', mayaNode)).toEqual([500])
  })

  it('counts the provider unbonding itself, whose memo ends at the node address', async () => {
    expect(
      await fetchMaya('UNBOND:BTC.BTC:455300000000000:maya1node', mayaProvider)
    ).toEqual([500])
    expect(vi.mocked(queryUrl).mock.lastCall?.[0]).toContain(
      'address=maya1node'
    )
  })
})
