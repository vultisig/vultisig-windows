import { Chain } from '@core/chain/Chain'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

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

export const DefiChainBalanceBannerFallback = ({
  chain,
}: DefiChainBalanceBannerFallbackProps) => {
  const { t } = useTranslation()
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
            <Text size={18} weight="600" color="contrast">
              {chain}
            </Text>
          </VStack>
        </HStack>
        <VStack gap={6}>
          <Text size={12} color="shy">
            {t('locked_in_defi')}
          </Text>
          <VStack gap={4}>
            <Text size={30} weight="700" color="contrast">
              <BalanceVisibilityAware>
                {formatFiatAmount(totalFiat)}
              </BalanceVisibilityAware>
            </Text>
          </VStack>
        </VStack>
      </BannerContent>
      <Ring />
      <GradientBackground />
    </BannerContainer>
  )
}
