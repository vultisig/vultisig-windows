import { Chain } from '@core/chain/Chain'

export const depositEnabledChains = [
  Chain.THORChain,
  Chain.MayaChain,
  Chain.Dydx,
  Chain.Ton,
  Chain.Kujira,
  Chain.Osmosis,
  Chain.Akash,
  Chain.Cosmos,
] as const

export type DepositEnabledChain = (typeof depositEnabledChains)[number]
