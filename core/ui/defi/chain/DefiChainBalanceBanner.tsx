import { Chain } from '@core/chain/Chain'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useThorchainDefiBalance } from './thor/useThorchainDefiBalance'
import { useCurrentDefiChain } from './useCurrentDefiChain'

export const DefiChainBalanceBanner = () => {
  const { t } = useTranslation()
  const chain = useCurrentDefiChain()
  const thorBalance = useThorchainDefiBalance()
  const formatFiatAmount = useFormatFiatAmount()

  // Use real balance for THORChain, fallback to $0 for other chains
  const totalBalance =
    chain === Chain.THORChain
      ? formatFiatAmount(thorBalance.totalUsd)
      : formatFiatAmount(0)
  const isLoading = chain === Chain.THORChain && thorBalance.isPending

  return (
    <Container>
      <VStack gap={8}>
        <HStack gap={8} alignItems="center">
          <SafeImage
            src={getChainLogoSrc(chain)}
            render={props => <ChainLogo {...props} />}
            fallback={<FallbackLogo>{chain.charAt(0)}</FallbackLogo>}
          />
          <Text size={16} weight="600" color="contrast">
            {chain}
          </Text>
        </HStack>
        <VStack gap={4}>
          <Text size={12} color="shy">
            {t('balance')}
          </Text>
          {isLoading ? (
            <Spinner />
          ) : (
            <Text size={28} weight="700" color="contrast">
              {totalBalance}
            </Text>
          )}
        </VStack>
      </VStack>
      <GradientBackground />
    </Container>
  )
}

const Container = styled.div`
  padding: 20px;
  border-radius: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};
  position: relative;
  overflow: hidden;
`

const ChainLogo = styled.img`
  ${sameDimensions(32)};
  border-radius: 50%;
`

const FallbackLogo = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${getColor('foregroundExtra')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${getColor('contrast')};
  font-weight: 600;
`

const GradientBackground = styled.div`
  width: 250px;
  height: 250px;
  position: absolute;
  right: -80px;
  bottom: -100px;
  border-radius: 250px;
  opacity: 0.6;
  background: radial-gradient(
    50% 50% at 50% 50%,
    rgba(51, 204, 204, 0.5) 0%,
    rgba(2, 18, 43, 0) 100%
  );
  filter: blur(30px);
  pointer-events: none;
`
