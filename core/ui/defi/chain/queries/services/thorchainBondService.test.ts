import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { thornodeBaseUrl } from '../constants'
import {
  fetchThorchainBondProviderRewards,
  getProviderPayoutBps,
} from './thorchainBondService'

vi.mock('@vultisig/lib-utils/query/queryUrl', () => ({
  queryUrl: vi.fn(),
}))

const nodeAddress = 'thor10czf2s89h79fsjmqqck85cdqeq536hw5ngz4lt'

describe('fetchThorchainBondProviderRewards', () => {
  beforeEach(() => {
    vi.mocked(queryUrl).mockReset()
  })

  it('splits the award the node held one block before a churn', async () => {
    vi.mocked(queryUrl).mockResolvedValue({
      current_award: '103341961766',
      bond_providers: {
        node_operator_fee: '2000',
        providers: [
          {
            bond_address: 'thor18zg6y8ylus8n3tpzu5xxge3yyquj03vylstrl3',
            bond: '29511174914053',
          },
          { bond_address: 'thor1everyoneelse', bond: '82796569644030' },
        ],
      },
    })

    const rewards = await fetchThorchainBondProviderRewards({
      nodeAddress,
      height: 27914369,
    })

    expect(vi.mocked(queryUrl).mock.calls[0][0]).toBe(
      `${thornodeBaseUrl}/node/${nodeAddress}?height=27914369`
    )
    expect(rewards['thor18zg6y8ylus8n3tpzu5xxge3yyquj03vylstrl3']).toBe(
      21724184536n
    )
  })
})

// Provider entries captured from /thorchain/node/thor10tsu3gfzgywyzuuyvmjmlpehdupdcrczemne9y
// on 2026-11-26: THORNode omits `bps` when Bond Yield is unset.
describe('getProviderPayoutBps', () => {
  it('reads the Bond Yield share a provider set', () => {
    expect(
      getProviderPayoutBps([
        {
          bond_address: 'thor1kuvaypgrdqpwjccdeprvzjkwf59pgy8xyx7pp5',
          bond: '4505368474649',
          bps: 10000,
        },
      ])
    ).toBe(10000)
  })

  it('has no share when the vault is not a provider of the node', () => {
    expect(getProviderPayoutBps([])).toBeUndefined()
  })

  it('treats an omitted share as 0', () => {
    expect(
      getProviderPayoutBps([
        {
          bond_address: 'thor1456ja57j5wasf23mhgjpskq8mwhxzxejplh0z5',
          bond: '100692753308382',
        },
      ])
    ).toBe(0)
  })
})
