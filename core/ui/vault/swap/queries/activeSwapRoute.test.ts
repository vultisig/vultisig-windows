import { Chain } from '@vultisig/core-chain/Chain'
import {
  FindSwapQuotesResult,
  SwapQuoteCandidate,
  SwapQuoteProviderName,
} from '@vultisig/core-chain/swap/quote/findSwapQuote'
import { BoundSwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { describe, expect, it } from 'vitest'

import { SwapRouteOverride } from '../state/routeOverride'
import {
  canSelectSwapRoute,
  getActiveSwapRouteOverride,
  getSwapQuoteCycleId,
  resolveActiveSwapQuote,
  resolveActiveSwapRoute,
} from './activeSwapRoute'

type CandidateInput = {
  providerName: SwapQuoteProviderName
  outputAmount: bigint
  safetyFingerprint: string
}

const makeCandidate = ({
  providerName,
  outputAmount,
  safetyFingerprint,
}: CandidateInput): SwapQuoteCandidate => {
  const quote: BoundSwapQuote = {
    quote: {
      native: {
        swapChain: Chain.THORChain,
        expected_amount_out: outputAmount.toString(),
        expiry: 1,
        fees: { affiliate: '0', asset: 'ETH.ETH', outbound: '0', total: '0' },
        memo: '',
        notes: '',
        outbound_delay_blocks: 0,
        outbound_delay_seconds: 0,
        recommended_min_amount_in: '0',
        warning: '',
      },
    },
    discounts: [],
    requestedAmount: 1000n,
    expiresAt: 1,
    safetyFingerprint,
  }

  return { quote, providerName, outputAmount }
}

const thorchain = makeCandidate({
  providerName: 'THORChain',
  outputAmount: 300n,
  safetyFingerprint: 'thorchain-cycle-1',
})
const lifi = makeCandidate({
  providerName: 'LiFi',
  outputAmount: 200n,
  safetyFingerprint: 'lifi-cycle-1',
})
const cowswap = makeCandidate({
  providerName: 'CowSwap',
  outputAmount: 100n,
  safetyFingerprint: 'cowswap-cycle-1',
})

// The winner is deliberately not `ranked[0]`: within the preference band the
// SDK may pick a lower-output provider, and the app must follow that pick.
const quotes: FindSwapQuotesResult = {
  best: lifi.quote,
  ranked: [thorchain, lifi, cowswap],
}

const overrideOn = (
  providerName: SwapQuoteProviderName,
  cycleId = getSwapQuoteCycleId(quotes)
): SwapRouteOverride => ({ providerName, cycleId })

describe('resolveActiveSwapQuote', () => {
  it('takes the auto-selected winner when nothing was picked', () => {
    expect(resolveActiveSwapQuote({ quotes, override: null })).toBe(lifi.quote)
  })

  it('hands the picked route to the caller that builds the keysign payload', () => {
    expect(
      resolveActiveSwapQuote({ quotes, override: overrideOn('CowSwap') })
    ).toBe(cowswap.quote)
  })

  it('re-defaults to the winner once a refresh starts a new quote cycle', () => {
    const refreshed: FindSwapQuotesResult = {
      best: thorchain.quote,
      ranked: [thorchain, lifi],
    }

    expect(
      resolveActiveSwapQuote({
        quotes: refreshed,
        override: overrideOn('CowSwap'),
      })
    ).toBe(thorchain.quote)
  })

  it('falls back to the winner when the picked provider stops quoting', () => {
    const withoutCowSwap: FindSwapQuotesResult = {
      best: lifi.quote,
      ranked: [thorchain, lifi],
    }

    expect(
      resolveActiveSwapQuote({
        quotes: withoutCowSwap,
        override: {
          providerName: 'CowSwap',
          cycleId: getSwapQuoteCycleId(withoutCowSwap),
        },
      })
    ).toBe(lifi.quote)
  })
})

describe('resolveActiveSwapRoute', () => {
  it('resolves the winner to its own candidate rather than the top-ranked one', () => {
    expect(resolveActiveSwapRoute({ quotes, override: null })).toBe(lifi)
  })

  it('resolves a pick to the candidate the sheet marks as selected', () => {
    expect(
      resolveActiveSwapRoute({ quotes, override: overrideOn('THORChain') })
    ).toBe(thorchain)
  })
})

describe('getActiveSwapRouteOverride', () => {
  it('reports a pick made in the current cycle', () => {
    const override = overrideOn('THORChain')

    expect(getActiveSwapRouteOverride({ quotes, override })).toBe(override)
  })

  it('drops a pick made against an earlier cycle', () => {
    expect(
      getActiveSwapRouteOverride({
        quotes,
        override: overrideOn('THORChain', 'lifi-cycle-0'),
      })
    ).toBeNull()
  })
})

describe('canSelectSwapRoute', () => {
  it('offers the row as soon as there is more than one candidate', () => {
    expect(canSelectSwapRoute([thorchain, lifi])).toBe(true)
  })

  it('hides the row when there is nothing to choose between', () => {
    expect(canSelectSwapRoute([thorchain])).toBe(false)
    expect(canSelectSwapRoute([])).toBe(false)
  })
})
