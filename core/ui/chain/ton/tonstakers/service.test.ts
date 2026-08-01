import { beforeEach, describe, expect, it, vi } from 'vitest'

import { tonstakersJettonMasterAddress, tonstakersPoolAddress } from './core'
import { getTonstakersProtocolInfo } from './service'

const queryUrlMock = vi.hoisted(() => vi.fn())

vi.mock('@vultisig/lib-utils/query/queryUrl', () => ({
  queryUrl: (...args: unknown[]) => queryUrlMock(...args),
}))

describe('getTonstakersProtocolInfo', () => {
  beforeEach(() => {
    queryUrlMock.mockReset()
  })

  it('returns a validated live-pool shape and tsTON/TON rate', async () => {
    queryUrlMock
      .mockResolvedValueOnce({
        pool: {
          address: tonstakersPoolAddress,
          name: 'Tonstakers',
          implementation: 'liquidTF',
          liquid_jetton_master: tonstakersJettonMasterAddress,
          apy: 9.75,
          min_stake: 1_000_000_000,
        },
      })
      .mockResolvedValueOnce({
        rates: {
          [tonstakersJettonMasterAddress]: { prices: { TON: 1.125 } },
        },
      })

    await expect(getTonstakersProtocolInfo()).resolves.toEqual({
      name: 'Tonstakers',
      apr: 9.75,
      minStake: 1_000_000_000n,
      tonPerTsTon: 1.125,
    })
  })

  it('fails closed if TonAPI points the pool at a different jetton master', async () => {
    queryUrlMock
      .mockResolvedValueOnce({
        pool: {
          address: tonstakersPoolAddress,
          implementation: 'liquidTF',
          liquid_jetton_master:
            '0:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          min_stake: 1_000_000_000,
        },
      })
      .mockResolvedValueOnce({
        rates: {
          [tonstakersJettonMasterAddress]: { prices: { TON: 1.125 } },
        },
      })

    await expect(getTonstakersProtocolInfo()).rejects.toThrow(
      'Tonstakers pool contract validation failed'
    )
  })

  it('rejects a missing or non-positive exchange rate', async () => {
    queryUrlMock
      .mockResolvedValueOnce({
        pool: {
          address: tonstakersPoolAddress,
          implementation: 'liquidTF',
          liquid_jetton_master: tonstakersJettonMasterAddress,
          min_stake: 1_000_000_000,
        },
      })
      .mockResolvedValueOnce({ rates: {} })

    await expect(getTonstakersProtocolInfo()).rejects.toThrow(
      'Tonstakers tsTON/TON rate is unavailable'
    )
  })
})
