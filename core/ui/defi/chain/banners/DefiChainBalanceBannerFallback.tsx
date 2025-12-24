import { Chain } from '@core/chain/Chain'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack, VStack } from '@lib/ui/layout/Stack'

import {
  BalanceValue,
  BannerContainer,
  BannerContent,
  ChainLogo,
  ChainTitle,
  FallbackLogo,
  GradientBackground,
  Ring,
} from './shared'

type DefiChainBalanceBannerFallbackProps = {
  chain: Chain
}

const totalFiat = 0

export const DefiChainBalanceBannerFallback = ({
  chain,
}: DefiChainBalanceBannerFallbackProps) => {
  const formatFiatAmount = useFormatFiatAmount()

  return (
    <BannerContainer>
      <BannerContent gap={10}>
        <HStack gap={12} alignItems="center">
          <SafeImage
            src={getChainLogoSrc(chain)}
            render={props => <ChainLogo {...props} />}
            fallback={<FallbackLogo>{chain.charAt(0)}</FallbackLogo>}
          />
          <VStack gap={2}>
            <ChainTitle>{chain}</ChainTitle>
          </VStack>
        </HStack>
        <BalanceValue>
          <BalanceVisibilityAware>
            {formatFiatAmount(totalFiat)}
          </BalanceVisibilityAware>
        </BalanceValue>
      </BannerContent>
      <Ring />
      <GradientBackground />
    </BannerContainer>
  )
}
