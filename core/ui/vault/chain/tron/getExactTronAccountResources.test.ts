import { afterEach, describe, expect, it, vi } from 'vitest'

import { getTronClaimChainAmountDisplay } from '../../deposit/tron/withdrawExpireUnfreeze'
import { getExactTronAccountResources } from './getExactTronAccountResources'

describe('getExactTronAccountResources', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('preserves unquoted SUN amounts above the safe-integer boundary', async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = String(input)

      if (url.endsWith('/wallet/getaccount')) {
        return new Response(
          `{
            "frozenV2": [
              { "amount": 10000000000000001 },
              { "type": "ENERGY", "amount": 9007199254740993 }
            ],
            "unfrozenV2": [
              {
                "unfreeze_amount": 10000000000000001,
                "unfreeze_expire_time": 1788489912000
              }
            ]
          }`,
          { status: 200 }
        )
      }

      return new Response(
        JSON.stringify({
          freeNetUsed: 10,
          freeNetLimit: 100,
          NetUsed: 20,
          NetLimit: 200,
          EnergyUsed: 30,
          EnergyLimit: 300,
        }),
        { status: 200 }
      )
    })
    vi.stubGlobal('fetch', fetchMock)

    const resources = await getExactTronAccountResources('TExactOwner')

    expect(resources).toEqual({
      bandwidth: { available: 270, total: 300, used: 30 },
      energy: { available: 270, total: 300, used: 30 },
      frozenForBandwidthSun: 10_000_000_000_000_001n,
      frozenForEnergySun: 9_007_199_254_740_993n,
      unfreezingEntries: [
        {
          unfreezeAmountSun: 10_000_000_000_000_001n,
          expireTimeMs: 1_788_489_912_000,
        },
      ],
    })
    expect(
      getTronClaimChainAmountDisplay({
        amount: resources.unfreezingEntries[0].unfreezeAmountSun.toString(),
        decimals: 6,
      })
    ).toBe('10000000000.000001')
  })

  it('rejects unsafe expiry values instead of silently rounding them', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL | Request) =>
        String(input).endsWith('/wallet/getaccount')
          ? new Response(
              '{"unfrozenV2":[{"unfreeze_amount":1,"unfreeze_expire_time":9007199254740993}]}',
              { status: 200 }
            )
          : new Response('{}', { status: 200 })
      )
    )

    await expect(getExactTronAccountResources('TExactOwner')).rejects.toThrow(
      "TRON unfreeze expiry exceeds JavaScript's safe integer range"
    )
  })
})
