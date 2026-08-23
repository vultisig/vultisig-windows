import { TFunction } from 'i18next'
import { describe, expect, it } from 'vitest'

import { defaultDefiChainTab, getDefiChainTabs } from './config'

const t = ((key: string) => key) as TFunction

const tabValues = (options: Parameters<typeof getDefiChainTabs>[1]): string[] =>
  getDefiChainTabs(t, options).map(tab => tab.value)

describe('defaultDefiChainTab', () => {
  it('opens Solana on Earn, matching iOS and Android', () => {
    expect(defaultDefiChainTab({ includeEarn: true })).toBe('earn')
  })

  it('opens bonding chains on Bonded', () => {
    expect(defaultDefiChainTab({ includeBonded: true })).toBe('bonded')
  })

  it('falls back to Staked when neither Earn nor Bonded is present', () => {
    expect(defaultDefiChainTab()).toBe('staked')
  })
})

describe('getDefiChainTabs', () => {
  it('leads Solana with Earn then Staked', () => {
    expect(
      tabValues({
        includeEarn: true,
        includeBonded: false,
        includeLps: false,
      })
    ).toEqual(['earn', 'staked'])
  })

  it('does not insert Earn on a bonding chain', () => {
    expect(
      tabValues({
        includeBonded: true,
        includeLps: false,
        includeEarn: false,
      })
    ).toEqual(['bonded', 'staked'])
  })
})
