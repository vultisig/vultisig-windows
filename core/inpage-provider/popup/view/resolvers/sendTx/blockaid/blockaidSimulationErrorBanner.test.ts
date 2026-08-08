import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { hasBlockaidSimulationErrorBanner } from './blockaidSimulationErrorBanner'

describe('hasBlockaidSimulationErrorBanner', () => {
  it('renders the banner for EVM chains', () => {
    expect(hasBlockaidSimulationErrorBanner(Chain.Ethereum)).toBe(true)
    expect(hasBlockaidSimulationErrorBanner(Chain.Base)).toBe(true)
    expect(hasBlockaidSimulationErrorBanner(Chain.Arbitrum)).toBe(true)
  })

  it('renders the banner for Solana', () => {
    expect(hasBlockaidSimulationErrorBanner(Chain.Solana)).toBe(true)
  })

  it('does not render the banner for other chain kinds', () => {
    expect(hasBlockaidSimulationErrorBanner(Chain.Bitcoin)).toBe(false)
    expect(hasBlockaidSimulationErrorBanner(Chain.THORChain)).toBe(false)
    expect(hasBlockaidSimulationErrorBanner(Chain.Cosmos)).toBe(false)
    expect(hasBlockaidSimulationErrorBanner(Chain.Sui)).toBe(false)
  })
})
