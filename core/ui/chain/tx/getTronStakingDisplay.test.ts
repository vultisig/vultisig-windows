import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { getTronStakingDisplay } from './getTronStakingDisplay'

describe('getTronStakingDisplay', () => {
  it.each([
    ['FREEZE:BANDWIDTH', 'freeze', 'BANDWIDTH'],
    ['FREEZE:ENERGY', 'freeze', 'ENERGY'],
    ['UNFREEZE:BANDWIDTH', 'unfreeze', 'BANDWIDTH'],
    ['UNFREEZE:ENERGY', 'unfreeze', 'ENERGY'],
  ])('recognizes %s', (memo, operation, resource) => {
    expect(getTronStakingDisplay({ chain: Chain.Tron, memo })).toEqual({
      operation,
      resource,
    })
  })

  it.each([
    undefined,
    '',
    'FREEZE',
    'FREEZE:',
    'FREEZE:CPU',
    'FREEZE:BANDWIDTH:ENERGY',
    'freeze:bandwidth',
    'THIS IS A FREEZE:BANDWIDTH',
    'STAKE:BANDWIDTH',
  ])('ignores the memo %s', memo => {
    expect(getTronStakingDisplay({ chain: Chain.Tron, memo })).toBeUndefined()
  })

  it('ignores a staking memo on another chain', () => {
    expect(
      getTronStakingDisplay({ chain: Chain.Ethereum, memo: 'FREEZE:ENERGY' })
    ).toBeUndefined()
  })
})
