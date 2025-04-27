import { Chain } from '@core/chain/Chain'

export const coinFinderChains = [Chain.THORChain] as const
export type CoinFinderChain = (typeof coinFinderChains)[number]
