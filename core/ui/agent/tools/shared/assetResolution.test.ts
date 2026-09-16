import { Chain } from '@vultisig/core-chain/Chain'
import { knownTokensIndex } from '@vultisig/core-chain/coin/knownTokens'
import { describe, expect, it } from 'vitest'

import {
  formatHumanAmount,
  resolveTickerByChainAndToken,
} from './assetResolution'

describe('formatHumanAmount', () => {
  it('formats a known native asset with canonical precision', () => {
    expect(formatHumanAmount('123456789', Chain.Bitcoin, '')).toBe('1.23456789')
  })

  it('formats a known token with registry precision', () => {
    const [address, token] = Object.entries(
      knownTokensIndex[Chain.Ethereum]!
    )[0]!
    const baseUnits = `1${'0'.repeat(token.decimals)}`

    expect(formatHumanAmount(baseUnits, Chain.Ethereum, address)).toBe('1')
  })

  it.each([
    ['unknown chain', 'NotAChain', ''],
    [
      'unknown token',
      Chain.Ethereum,
      '0x0000000000000000000000000000000000000000',
    ],
  ])('refuses to guess precision for an %s', (_, chain, tokenAddress) => {
    expect(formatHumanAmount('1000000000000000000', chain, tokenAddress)).toBe(
      null
    )
  })
})

const solanaUsdc = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

describe('canonical non-EVM token identity', () => {
  it('resolves the canonical Solana ticker and precision', () => {
    expect(resolveTickerByChainAndToken(Chain.Solana, solanaUsdc)).toBe('USDC')
    expect(formatHumanAmount('1234567', Chain.Solana, solanaUsdc)).toBe(
      '1.234567'
    )
  })

  it('does not trust metadata for a case-mutated Solana mint', () => {
    expect(
      resolveTickerByChainAndToken(Chain.Solana, solanaUsdc.toLowerCase())
    ).not.toBe('USDC')
    expect(
      formatHumanAmount('1234567', Chain.Solana, solanaUsdc.toLowerCase())
    ).toBeNull()
  })
})
