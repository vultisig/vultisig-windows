import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { Image } from '@lib/ui/image/Image'
import { IbcEnabledCosmosChain } from '@vultisig/core-chain/Chain'

import {
  BalanceValue,
  BannerContent,
  ChainTitle,
  TerraBannerContainer,
  TerraLogoWrapper,
} from './shared'

type DefiTerraBalanceBannerProps = {
  chain: IbcEnabledCosmosChain
  /** Aggregate fiat across all delegations + liquid balance for the staking token. */
  totalFiat: number
  /** Display label for the chain (e.g. "Terra" / "Terra Classic"). */
  title: string
}

/**
 * Terra-family banner. Mirrors the Figma "DeFi Page" hero card:
 * chain name + balance stacked top-left, with the LUNA brand glyph +
 * halo decoration bled off the right edge.
 *
 * Decoration asset (`referrals-terra-logo.png`) is the Figma-exported
 * glyph including the halo ring — so the previous CSS-drawn `TerraRing`
 * is no longer needed.
 */
export const DefiTerraBalanceBanner = ({
  totalFiat,
  title,
}: DefiTerraBalanceBannerProps) => {
  const formatFiatAmount = useFormatFiatAmount()

  return (
    <TerraBannerContainer>
      <TerraLogoWrapper>
        <Image
          src="/core/images/referrals-terra-logo.png"
          width="100%"
          height="100%"
        />
      </TerraLogoWrapper>
      <BannerContent gap={8} style={{ alignItems: 'flex-start' }}>
        <ChainTitle>{title}</ChainTitle>
        <BalanceValue>
          <BalanceVisibilityAware>
            {formatFiatAmount(totalFiat)}
          </BalanceVisibilityAware>
        </BalanceValue>
      </BannerContent>
    </TerraBannerContainer>
  )
}
