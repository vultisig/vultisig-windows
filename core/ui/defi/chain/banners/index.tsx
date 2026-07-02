import { Chain } from '@vultisig/core-chain/Chain'
import { ComponentType } from 'react'

import { DefiChainBalanceBannerFallback } from './DefiChainBalanceBannerFallback'
import { DefiMayachainBalanceBanner } from './DefiMayachainBalanceBanner'
import { DefiQbtcBalanceBanner } from './DefiQbtcBalanceBanner'
import { DefiSolanaBalanceBanner } from './DefiSolanaBalanceBanner'
import { DefiTerraChainBanner } from './DefiTerraChainBanner'
import { DefiThorchainBalanceBanner } from './DefiThorchainBalanceBanner'
import { DefiTonBalanceBanner } from './DefiTonBalanceBanner'
import { DefiTronBalanceBanner } from './DefiTronBalanceBanner'

const chainBannerRegistry: Partial<
  Record<Chain, ComponentType<Record<string, never>>>
> = {
  [Chain.THORChain]: DefiThorchainBalanceBanner,
  [Chain.MayaChain]: DefiMayachainBalanceBanner,
  [Chain.Tron]: DefiTronBalanceBanner,
  [Chain.Terra]: () => (
    <DefiTerraChainBanner chain={Chain.Terra} title="Terra" />
  ),
  [Chain.TerraClassic]: () => (
    <DefiTerraChainBanner chain={Chain.TerraClassic} title="Terra Classic" />
  ),
  [Chain.QBTC]: DefiQbtcBalanceBanner,
  [Chain.Ton]: DefiTonBalanceBanner,
  [Chain.Solana]: DefiSolanaBalanceBanner,
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
