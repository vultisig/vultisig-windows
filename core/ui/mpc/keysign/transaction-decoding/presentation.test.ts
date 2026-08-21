import { describe, expect, it } from 'vitest'

import {
  getDoneTransactionTitleKey,
  getVerifyTransactionTitleKey,
} from './presentation'

describe('signed transaction presentation', () => {
  it('keeps generic and screen-owned operations on their existing fallbacks', () => {
    for (const operation of [
      'transfer',
      'swap',
      'approve',
      'contractCall',
      'unknown',
    ] as const) {
      expect(getVerifyTransactionTitleKey(operation)).toBeUndefined()
    }

    for (const operation of [
      'transfer',
      'swap',
      'contractCall',
      'unknown',
    ] as const) {
      expect(getDoneTransactionTitleKey(operation)).toBeUndefined()
    }
  })

  it.each([
    ['stake', 'you_are_staking', 'staked'],
    ['unstake', 'you_are_unstaking', 'unstake'],
    ['bond', 'you_are_bonding', 'bonded'],
    ['unbond', 'you_are_unbonding', 'unbond'],
    ['delegate', 'you_are_staking', 'staked'],
    ['undelegate', 'you_are_unstaking', 'unstake'],
    ['claimRewards', 'you_are_claiming', 'claim_rewards'],
    ['mint', 'you_are_minting', 'mint'],
    ['redeem', 'you_are_redeeming', 'redeem'],
    ['addLiquidity', 'add_thor_lp', 'add_thor_lp'],
    ['removeLiquidity', 'remove_thor_lp', 'remove_thor_lp'],
    ['rebond', 'signed_tx_you_are_rebonding', 'signed_tx_rebonded'],
    ['merge', 'signed_tx_you_are_merging', 'signed_tx_merged'],
    ['unmerge', 'signed_tx_you_are_unmerging', 'signed_tx_unmerged'],
    ['switchChain', 'signed_tx_you_are_switching', 'signed_tx_switched'],
    [
      'limitOrderCancel',
      'swap_limit_cancel_verify_title',
      'swap_limit_cancel_sent',
    ],
  ] as const)(
    'maps %s to explicit Verify and Done vocabulary',
    (operation, verify, done) => {
      expect(getVerifyTransactionTitleKey(operation)).toBe(verify)
      expect(getDoneTransactionTitleKey(operation)).toBe(done)
    }
  )

  it('keeps vote deliberately silent on Verify but explicit on Done', () => {
    expect(getVerifyTransactionTitleKey('vote')).toBeUndefined()
    expect(getDoneTransactionTitleKey('vote')).toBe('vote')
  })
})
