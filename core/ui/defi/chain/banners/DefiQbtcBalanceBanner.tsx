import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { cosmosStakedFiat } from '@core/ui/chain/cosmos/staking/cosmosStakedFiat'
import { useCosmosDelegationsQuery } from '@core/ui/chain/cosmos/staking/queries/useCosmosDelegationsQuery'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'

import { DefiBannerBalance } from './DefiBannerBalance'
import {
  BannerContent,
  BannerLogoGlow,
  BannerLogoImage,
  ChainTitle,
  FallbackLogo,
  TerraBannerContainer,
} from './shared'

/**
 * QBTC DeFi hero banner. QBTC is a Cosmos-SDK staking chain like Terra, so it
 * reuses the Terra hero layout — chain name + staked fiat stacked top-left —
 * but renders the QBTC chain logo inside a glow ring bled off the right edge
 * (Terra ships a pre-composited brand glyph; QBTC uses its plain chain logo).
 *
 * qbtc-testnet has no spot-price feed, so the fiat total resolves to $0.00
 * (same as the portfolio rollup); the staked amount is shown on the positions
 * list below.
 */
export const DefiQbtcBalanceBanner = () => {
  const delegatorAddress = useCurrentVaultAddress(Chain.QBTC)
  const delegationsQuery = useCosmosDelegationsQuery({
    chain: Chain.QBTC,
    delegatorAddress: delegatorAddress ?? '',
  })
  const priceCoin = { ...chainFeeCoin[Chain.QBTC], chain: Chain.QBTC }
  const priceQuery = useCoinPricesQuery({ coins: [priceCoin] })
  const price = priceQuery.data?.[coinKeyToString({ chain: Chain.QBTC })]

  const totalFiat = cosmosStakedFiat({
    delegations: delegationsQuery.data,
    price,
    decimals: chainFeeCoin[Chain.QBTC].decimals,
  })

  return (
    <TerraBannerContainer>
      <BannerContent gap={8} style={{ alignItems: 'flex-start' }}>
        <ChainTitle>QBTC</ChainTitle>
        <DefiBannerBalance chain={Chain.QBTC} value={totalFiat} />
      </BannerContent>
      <BannerLogoGlow>
        <SafeImage
          src={getChainLogoSrc(Chain.QBTC)}
          render={props => <BannerLogoImage {...props} />}
          fallback={<FallbackLogo>{Chain.QBTC.charAt(0)}</FallbackLogo>}
        />
      </BannerLogoGlow>
    </TerraBannerContainer>
  )
}
