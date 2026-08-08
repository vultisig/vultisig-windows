import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Chain } from '@vultisig/core-chain/Chain'

import { DefiBannerBalance } from './DefiBannerBalance'
import {
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
        <DefiBannerBalance chain={chain} value={totalFiat} />
      </BannerContent>
      <Ring />
      <GradientBackground />
    </BannerContainer>
  )
}
