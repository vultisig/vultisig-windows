import { Chain } from '@core/chain/Chain'
import { ComponentType } from 'react'

import { DefiChainBalanceBannerFallback } from './DefiChainBalanceBannerFallback'
import { DefiMayachainBalanceBanner } from './DefiMayachainBalanceBanner'
import { DefiThorchainBalanceBanner } from './DefiThorchainBalanceBanner'
import { DefiTronBalanceBanner } from './DefiTronBalanceBanner'

const chainBannerRegistry: Partial<
  Record<Chain, ComponentType<Record<string, never>>>
> = {
  [Chain.THORChain]: DefiThorchainBalanceBanner,
  [Chain.MayaChain]: DefiMayachainBalanceBanner,
  [Chain.Tron]: DefiTronBalanceBanner,
}

type DefiChainBalanceBannerProps = {
  chain: Chain
}

export const DefiChainBalanceBanner = ({
  chain,
}: DefiChainBalanceBannerProps) => {
  const ChainBanner = chainBannerRegistry[chain]

  if (ChainBanner) {
    return <ChainBanner />
  }

  return <DefiChainBalanceBannerFallback chain={chain} />
}
