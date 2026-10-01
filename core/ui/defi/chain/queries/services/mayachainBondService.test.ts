import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mayanodeBaseUrl } from '../constants'
import { mayaCoin } from '../tokens'
import {
  fetchBondPositions,
  fetchMayachainBondProviderRewards,
} from './mayachainBondService'

vi.mock('@vultisig/lib-utils/query/queryUrl', () => ({
  queryUrl: vi.fn(),
}))

const myAddress = 'maya1me'
const nodeAddress = 'maya1node'

// MAYANode block 17904022: the node's `reward` is split across the provider
// rows, the operator fee included in the operator's row.
const node = {
  node_address: nodeAddress,
  status: 'Active',
  reward: '7000694276124',
  bond_providers: {
    node_operator_fee: '1500',
    providers: [
      { bond_address: 'maya1other', bond: '100', reward: '1050300962182' },
      { bond_address: myAddress, bond: '300', reward: '5950393313942' },
    ],
  },
}

describe('mayachainBondService', () => {
  beforeEach(() => {
    vi.mocked(queryUrl).mockReset()
  })

  it("takes Next Reward from the vault's own provider row", async () => {
    vi.mocked(queryUrl).mockResolvedValue([node])

    const { positions } = await fetchBondPositions({
      address: myAddress,
      churns: [],
      networkInfo: {},
      health: {},
    })

    expect(positions[0].nextReward).toBe(
      fromChainAmount(5950393313942n, mayaCoin.decimals)
    )
  })

  it('reads provider payouts from the node at a past block', async () => {
    vi.mocked(queryUrl).mockResolvedValue(node)

    const rewards = await fetchMayachainBondProviderRewards({
      nodeAddress,
      height: 17904022,
    })

    expect(vi.mocked(queryUrl).mock.calls[0][0]).toBe(
      `${mayanodeBaseUrl}/node/${nodeAddress}?height=17904022`
    )
    expect(rewards).toEqual({
      maya1other: 1050300962182n,
      [myAddress]: 5950393313942n,
    })
  })
})
