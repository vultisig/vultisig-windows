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
  getSwapQuoteRequestId,
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

const requestId = getSwapQuoteRequestId({
  from: { chain: Chain.Ethereum },
  to: { chain: Chain.Ethereum, id: '0xusdc' },
  amount: 1000n,
})

const overrideOn = (
  providerName: SwapQuoteProviderName,
  pickedFor = requestId
): SwapRouteOverride => ({ providerName, requestId: pickedFor })

describe('getSwapQuoteRequestId', () => {
  it('is unchanged by a re-quote of the same pair and amount', () => {
    expect(
      getSwapQuoteRequestId({
        from: { chain: Chain.Ethereum },
        to: { chain: Chain.Ethereum, id: '0xusdc' },
        amount: 1000n,
      })
    ).toBe(requestId)
  })

  it('changes when the amount changes', () => {
    expect(
      getSwapQuoteRequestId({
        from: { chain: Chain.Ethereum },
        to: { chain: Chain.Ethereum, id: '0xusdc' },
        amount: 1001n,
      })
    ).not.toBe(requestId)
  })

  it('changes when the pair is reversed', () => {
    expect(
      getSwapQuoteRequestId({
        from: { chain: Chain.Ethereum, id: '0xusdc' },
        to: { chain: Chain.Ethereum },
        amount: 1000n,
      })
    ).not.toBe(requestId)
  })
})

describe('resolveActiveSwapQuote', () => {
  it('takes the auto-selected winner when nothing was picked', () => {
    expect(resolveActiveSwapQuote({ quotes, override: null, requestId })).toBe(
      lifi.quote
    )
  })

  it('hands the picked route to the caller that builds the keysign payload', () => {
    expect(
      resolveActiveSwapQuote({
        quotes,
        override: overrideOn('CowSwap'),
        requestId,
      })
    ).toBe(cowswap.quote)
  })

  it('keeps the pick through a refresh, on its newly fetched quote', () => {
    const refreshedCowswap = makeCandidate({
      providerName: 'CowSwap',
      outputAmount: 120n,
      safetyFingerprint: 'cowswap-cycle-2',
    })
    const refreshed: FindSwapQuotesResult = {
      best: thorchain.quote,
      ranked: [thorchain, refreshedCowswap],
    }

    expect(
      resolveActiveSwapQuote({
        quotes: refreshed,
        override: overrideOn('CowSwap'),
        requestId,
      })
    ).toBe(refreshedCowswap.quote)
  })

  it('re-defaults to the winner once the user edits the swap', () => {
    expect(
      resolveActiveSwapQuote({
        quotes,
        override: overrideOn('CowSwap', 'a-different-swap'),
        requestId,
      })
    ).toBe(lifi.quote)
  })

  it('falls back to the winner when the picked provider stops quoting', () => {
    const withoutCowSwap: FindSwapQuotesResult = {
      best: lifi.quote,
      ranked: [thorchain, lifi],
    }

    expect(
      resolveActiveSwapQuote({
        quotes: withoutCowSwap,
        override: overrideOn('CowSwap'),
        requestId,
      })
    ).toBe(lifi.quote)
  })
})

describe('resolveActiveSwapRoute', () => {
  it('resolves the winner to its own candidate rather than the top-ranked one', () => {
    expect(resolveActiveSwapRoute({ quotes, override: null, requestId })).toBe(
      lifi
    )
  })

  it('resolves a pick to the candidate the sheet marks as selected', () => {
    expect(
      resolveActiveSwapRoute({
        quotes,
        override: overrideOn('THORChain'),
        requestId,
      })
    ).toBe(thorchain)
  })
})

describe('getActiveSwapRouteOverride', () => {
  it('reports a pick made for the swap being quoted', () => {
    const override = overrideOn('THORChain')

    expect(getActiveSwapRouteOverride({ quotes, override, requestId })).toBe(
      override
    )
  })

  it('drops a pick made for a different swap', () => {
    expect(
      getActiveSwapRouteOverride({
        quotes,
        override: overrideOn('THORChain', 'a-different-swap'),
        requestId,
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
