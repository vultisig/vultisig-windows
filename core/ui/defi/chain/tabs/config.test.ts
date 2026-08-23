import { createInstance } from 'i18next'
import { describe, expect, it } from 'vitest'

import { getDefiChainTabs } from './config'

// A real i18next instance with no resources: t(key) returns the key verbatim,
// giving an identity translator with a genuine TFunction type (no casts). The
// labels are irrelevant to ordering, and echoing the key back means a failure
// names the tab rather than a translated string.
const i18n = createInstance()
void i18n.init({ lng: 'en', resources: {} })
const t = i18n.t

const tabValues = (...args: Parameters<typeof getDefiChainTabs>) =>
  getDefiChainTabs(...args).map(tab => tab.value)

describe('getDefiChainTabs', () => {
  it('leads with Earn where the chain has one, per the design', () => {
    // Solana's gating: no bonding, no LPs, no governance, earn.
    expect(
      tabValues(t, {
        includeBonded: false,
        includeLps: false,
        includeEarn: true,
      })
    ).toStrictEqual(['earn', 'staked'])
  })

  it('keeps Bonded leading on the chains that have it', () => {
    // THORChain / MayaChain have no earn segment, so Staked stays second.
    expect(
      tabValues(t, { includeBonded: true, includeLps: false })
    ).toStrictEqual(['bonded', 'staked'])
  })

  it('falls back to Staked alone for a chain with neither', () => {
    expect(
      tabValues(t, { includeBonded: false, includeLps: false })
    ).toStrictEqual(['staked'])
  })
})
