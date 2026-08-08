import { rippleTokenId } from '@vultisig/core-chain/chains/ripple/issuedCurrency'
import { describe, expect, it } from 'vitest'

import { needsRippleTrustLine, RippleTrustLine } from './trustLine'

const issuer = 'rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz'
const otherIssuer = 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De'

const soloId = rippleTokenId({ currency: 'SOLO', issuer })
const soloCode = '534F4C4F00000000000000000000000000000000'

const line = (overrides: Partial<RippleTrustLine> = {}): RippleTrustLine => ({
  account: issuer,
  currency: soloCode,
  ...overrides,
})

describe('needsRippleTrustLine', () => {
  it('reports a token with no matching line as needing one', () => {
    expect(needsRippleTrustLine({ tokenId: soloId, lines: [] })).toBe(true)
  })

  it('reports a token that already has a line as not needing one', () => {
    expect(needsRippleTrustLine({ tokenId: soloId, lines: [line()] })).toBe(
      false
    )
  })

  it('matches a currency code the node spelled in lowercase hex', () => {
    expect(
      needsRippleTrustLine({
        tokenId: soloId,
        lines: [line({ currency: soloCode.toLowerCase() })],
      })
    ).toBe(false)
  })

  it('matches a standard 3-character currency code', () => {
    expect(
      needsRippleTrustLine({
        tokenId: rippleTokenId({ currency: 'USD', issuer }),
        lines: [line({ currency: 'USD' })],
      })
    ).toBe(false)
  })

  it('does not match the same currency from a different issuer', () => {
    // Two issuers can share a ticker on XRPL, so the issuer is what
    // distinguishes them — a line with the other issuer is not this token.
    expect(
      needsRippleTrustLine({
        tokenId: soloId,
        lines: [line({ account: otherIssuer })],
      })
    ).toBe(true)
  })

  it('does not match on issuer casing, which is base58 and significant', () => {
    expect(
      needsRippleTrustLine({
        tokenId: soloId,
        lines: [line({ account: issuer.toLowerCase() })],
      })
    ).toBe(true)
  })

  it('offers no activation for an id it cannot parse', () => {
    expect(needsRippleTrustLine({ tokenId: 'not-a-token-id', lines: [] })).toBe(
      false
    )
  })
})
