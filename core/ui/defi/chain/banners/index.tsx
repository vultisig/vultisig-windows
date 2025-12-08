import { Chain } from '@core/chain/Chain'
import { ComponentType } from 'react'

import { DefiChainBalanceBannerFallback } from './DefiChainBalanceBannerFallback'
import { DefiThorchainBalanceBanner } from './DefiThorchainBalanceBanner'

const chainBannerRegistry: Partial<Record<Chain, ComponentType>> = {
  [Chain.THORChain]: DefiThorchainBalanceBanner,
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
