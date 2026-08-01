import { Chain } from '@vultisig/core-chain/Chain'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { describe, expect, it } from 'vitest'

import { getManageableCoins } from './manageableCoins'

const issuer = 'rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz'

const xrp: Coin = { chain: Chain.Ripple, ticker: 'XRP', decimals: 6 }

const solo: Coin = {
  chain: Chain.Ripple,
  id: `534F4C4F00000000000000000000000000000000.${issuer}`,
  ticker: 'SOLO',
  decimals: 15,
}

const rlusd: Coin = {
  chain: Chain.Ripple,
  id: '524C555344000000000000000000000000000000.rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De',
  ticker: 'RLUSD',
  decimals: 15,
  logo: 'rlusd',
  priceProviderId: 'ripple-usd',
}

describe('getManageableCoins', () => {
  it('lists a held custom token that is in neither the curated set nor the whitelist', () => {
    // The SOLO the user added by id: without it here the manage screen cannot
    // show it, so the user has no way to remove it.
    const result = getManageableCoins({
      known: [rlusd],
      whitelisted: [],
      current: [xrp, solo],
    })

    expect(result).toContainEqual(solo)
  })

  it('excludes the native fee coin, which is not togglable here', () => {
    const result = getManageableCoins({
      known: [],
      whitelisted: [],
      current: [xrp, solo],
    })

    expect(result).toEqual([solo])
  })

  it('keeps curated metadata for a token that is also held', () => {
    // The stored copy may predate curation, so the curated entry must win.
    const heldWithoutLogo: Coin = {
      ...rlusd,
      logo: undefined,
      priceProviderId: undefined,
    }

    const result = getManageableCoins({
      known: [rlusd],
      whitelisted: [],
      current: [heldWithoutLogo],
    })

    expect(result).toEqual([rlusd])
  })

  it('does not duplicate a token present in several sources', () => {
    // Distinct objects, so this proves coins are matched structurally rather
    // than by reference identity.
    const result = getManageableCoins({
      known: [{ ...rlusd }],
      whitelisted: [{ ...rlusd }],
      current: [{ ...rlusd }],
    })

    expect(result).toHaveLength(1)
  })
})
