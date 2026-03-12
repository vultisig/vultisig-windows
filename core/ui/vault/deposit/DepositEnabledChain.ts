import { Chain } from '@core/chain/Chain'

export const depositEnabledChains = [
  Chain.THORChain,
  Chain.MayaChain,
  Chain.Dydx,
  Chain.Ton,
  Chain.Tron,
  Chain.Kujira,
  Chain.Osmosis,
  Chain.Cosmos,
  Chain.Avalanche,
  Chain.Base,
  Chain.BitcoinCash,
  Chain.BSC,
  Chain.Bitcoin,
  Chain.Dash,
  Chain.Dogecoin,
  Chain.Ethereum,
  Chain.Litecoin,
  Chain.Ripple,
  Chain.Arbitrum,
  Chain.Zcash,
] as const satisfies readonly Chain[]

export type DepositEnabledChain = (typeof depositEnabledChains)[number]
