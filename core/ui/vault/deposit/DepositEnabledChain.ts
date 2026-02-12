import { Chain } from '@core/chain/Chain'
import { featureFlags } from '@core/ui/featureFlags'

const allDepositEnabledChains = [
  Chain.THORChain,
  Chain.MayaChain,
  Chain.Dydx,
  Chain.Ton,
  Chain.Tron,
  Chain.Kujira,
  Chain.Osmosis,
  Chain.Cosmos,
] as const satisfies readonly Chain[]

export type DepositEnabledChain = (typeof allDepositEnabledChains)[number]

export const depositEnabledChains: readonly Chain[] =
  allDepositEnabledChains.filter(
    chain => chain !== Chain.Tron || featureFlags.tronResources
  )
