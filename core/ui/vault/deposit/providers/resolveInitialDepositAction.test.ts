import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { resolveInitialDepositAction } from './DepositActionProvider'

describe('resolveInitialDepositAction', () => {
  it('opens Rewards Payout on THORChain although the action picker does not list it', () => {
    expect(
      resolveInitialDepositAction({
        chain: Chain.THORChain,
        preferredAction: 'bond_yield',
        actions: ['bond', 'unbond'],
      })
    ).toBe('bond_yield')
  })

  it('does not open Rewards Payout on MayaChain', () => {
    expect(
      resolveInitialDepositAction({
        chain: Chain.MayaChain,
        preferredAction: 'bond_yield',
        actions: ['bond_with_lp'],
      })
    ).toBe('bond_with_lp')
  })
})
