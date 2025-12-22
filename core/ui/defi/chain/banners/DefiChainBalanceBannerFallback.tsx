import { Chain } from '@core/chain/Chain'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import styled from 'styled-components'

import {
  BannerContainer,
  BannerContent,
  ChainLogo,
  FallbackLogo,
  GradientBackground,
  Ring,
} from './shared'

type DefiChainBalanceBannerFallbackProps = {
  chain: Chain
}

const totalFiat = 0

const ChainTitle = styled(Text)`
  color: #f0f4fc;
  font-family: Brockmann, sans-serif;
  font-size: 18px;
  font-weight: 500;
  line-height: 28px;
  letter-spacing: -0.09px;
`

const BalanceValue = styled(Text)`
  color: #f0f4fc;
  font-family: Satoshi, sans-serif;
  font-size: 28px;
  font-weight: 500;
  line-height: 34px;
  letter-spacing: -0.56px;
`

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
