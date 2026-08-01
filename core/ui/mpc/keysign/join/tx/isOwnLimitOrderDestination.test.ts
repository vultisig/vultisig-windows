import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { isOwnLimitOrderDestination } from './isOwnLimitOrderDestination'

const evmChecksummed = '0x14F6Ed6CBb27b607b0E2A48551A988F1a19c89B6'
const solanaAddress = '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj'

describe('isOwnLimitOrderDestination', () => {
  // EVM checksum casing renders the same account two ways; they must match.
  it('matches EVM addresses regardless of checksum casing', () => {
    expect(
      isOwnLimitOrderDestination({
        destinationAddress: evmChecksummed.toLowerCase(),
        targetChain: Chain.Ethereum,
        coins: [{ chain: Chain.Ethereum, address: evmChecksummed }],
      })
    ).toBe(true)
  })

  it('matches an exact base58 address', () => {
    expect(
      isOwnLimitOrderDestination({
        destinationAddress: solanaAddress,
        targetChain: Chain.Solana,
        coins: [{ chain: Chain.Solana, address: solanaAddress }],
      })
    ).toBe(true)
  })

  // Base58 is case-sensitive: two addresses differing only in case are
  // different accounts. Folding case here would hide a genuinely external
  // payout from the co-signer.
  it('does not equate base58 addresses that differ only in case', () => {
    expect(
      isOwnLimitOrderDestination({
        destinationAddress: solanaAddress.toLowerCase(),
        targetChain: Chain.Solana,
        coins: [{ chain: Chain.Solana, address: solanaAddress }],
      })
    ).toBe(false)
  })

  // Same string on a different chain is a different account entirely.
  it('only compares coins on the target chain', () => {
    expect(
      isOwnLimitOrderDestination({
        destinationAddress: evmChecksummed,
        targetChain: Chain.Ethereum,
        coins: [{ chain: Chain.Avalanche, address: evmChecksummed }],
      })
    ).toBe(false)
  })

  // Unknown target chain means ownership can't be confirmed: fail visible.
  it('returns false when the target chain is unknown', () => {
    expect(
      isOwnLimitOrderDestination({
        destinationAddress: solanaAddress,
        targetChain: undefined,
        coins: [{ chain: Chain.Solana, address: solanaAddress }],
      })
    ).toBe(false)
  })

  it('returns false for an empty vault', () => {
    expect(
      isOwnLimitOrderDestination({
        destinationAddress: solanaAddress,
        targetChain: Chain.Solana,
        coins: [],
      })
    ).toBe(false)
  })
})
