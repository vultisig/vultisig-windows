import { Chain } from './Chain'
import { getDefaultVisibleChains } from './chainGroups'

describe('getDefaultVisibleChains', () => {
  it('keeps one representative chain per grouped family', () => {
    expect(
      getDefaultVisibleChains([
        Chain.Arbitrum,
        Chain.Ethereum,
        Chain.Cosmos,
        Chain.Osmosis,
        Chain.THORChain,
        Chain.MayaChain,
        Chain.Solana,
      ])
    ).toEqual([Chain.Ethereum, Chain.Cosmos, Chain.THORChain, Chain.Solana])
  })

  it('falls back to the first available chain when the representative is absent', () => {
    expect(
      getDefaultVisibleChains([
        Chain.Arbitrum,
        Chain.Base,
        Chain.Osmosis,
        Chain.Kujira,
        Chain.MayaChain,
      ])
    ).toEqual([Chain.Arbitrum, Chain.Osmosis, Chain.MayaChain])
  })
})
