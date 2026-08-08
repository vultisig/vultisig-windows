import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { enrichPolicyFields } from './policyHelpers'

describe('enrichPolicyFields amount precision', () => {
  it('renders a known native amount', () => {
    const policy: Record<string, unknown> = {}

    enrichPolicyFields(policy, {
      asset: { chain: Chain.Bitcoin, token: '' },
      recipients: [{ amount: '123456789' }],
    })

    expect(policy.amount).toBe('1.23456789')
  })

  it('clears a stale recipient amount when precision cannot be resolved', () => {
    const policy: Record<string, unknown> = { amount: 'stale' }

    enrichPolicyFields(policy, {
      asset: { chain: 'NotAChain', token: '' },
      recipients: [{ amount: '1000000000000000000' }],
    })

    expect(policy).not.toHaveProperty('amount')
  })

  it('clears a stale transfer amount when precision cannot be resolved', () => {
    const policy: Record<string, unknown> = { amount: 'stale' }

    enrichPolicyFields(policy, {
      from: { chain: 'NotAChain', token: '' },
      fromAmount: '1000000000000000000',
    })

    expect(policy).not.toHaveProperty('amount')
  })
})
