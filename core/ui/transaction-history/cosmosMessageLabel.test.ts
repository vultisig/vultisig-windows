import { TFunction } from 'i18next'
import { describe, expect, it } from 'vitest'

import {
  deriveCosmosMessageLabel,
  getCosmosMessageLabelKey,
  getTransactionTagLabel,
} from './cosmosMessageLabel'

// Identity translator: returns the key it's given so assertions can check which
// translation key was selected without loading the real i18n resources.
const identityT = ((key: string) => key) as unknown as TFunction

describe('getCosmosMessageLabelKey', () => {
  it('maps known staking/gov/distribution typeUrls to translation keys', () => {
    expect(
      getCosmosMessageLabelKey('/cosmos.staking.v1beta1.MsgDelegate')
    ).toBe('delegate')
    expect(
      getCosmosMessageLabelKey('/cosmos.staking.v1beta1.MsgUndelegate')
    ).toBe('undelegate')
    expect(
      getCosmosMessageLabelKey('/cosmos.staking.v1beta1.MsgBeginRedelegate')
    ).toBe('redelegate')
    expect(
      getCosmosMessageLabelKey(
        '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward'
      )
    ).toBe('claim_rewards')
    expect(getCosmosMessageLabelKey('/cosmos.gov.v1.MsgVote')).toBe('vote')
    expect(getCosmosMessageLabelKey('/cosmos.gov.v1beta1.MsgVote')).toBe('vote')
    expect(getCosmosMessageLabelKey('/cosmos.bank.v1beta1.MsgSend')).toBe(
      'send'
    )
  })

  it('returns undefined for unmapped typeUrls', () => {
    expect(
      getCosmosMessageLabelKey('/cosmos.foo.v1.MsgSomethingNew')
    ).toBeUndefined()
  })
})

describe('deriveCosmosMessageLabel', () => {
  it('uses the last dotted segment with the Msg prefix stripped', () => {
    expect(deriveCosmosMessageLabel('/cosmos.foo.v1.MsgClaim')).toBe('Claim')
    expect(deriveCosmosMessageLabel('/some.module.v2.MsgFancyAction')).toBe(
      'FancyAction'
    )
  })
})

describe('getTransactionTagLabel', () => {
  it('returns undefined when there is no message typeUrl (non-Cosmos send)', () => {
    expect(
      getTransactionTagLabel({ messageTypeUrl: undefined, t: identityT })
    ).toBeUndefined()
  })

  it('resolves a known typeUrl through the translator', () => {
    expect(
      getTransactionTagLabel({
        messageTypeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
        t: identityT,
      })
    ).toBe('delegate')
  })

  it('falls back to the derived label for an unmapped typeUrl', () => {
    expect(
      getTransactionTagLabel({
        messageTypeUrl: '/cosmos.foo.v1.MsgClaim',
        t: identityT,
      })
    ).toBe('Claim')
  })
})
