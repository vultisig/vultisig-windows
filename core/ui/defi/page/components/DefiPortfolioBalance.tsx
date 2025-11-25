import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { ManageVaultBalanceVisibility } from '@core/ui/vault/page/balance/visibility/ManageVaultBalanceVisibility'
import { useVaultTotalBalanceQuery } from '@core/ui/vault/queries/useVaultTotalBalanceQuery'
import { Image } from '@lib/ui/image/Image'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const DefiPortfolioBalance = () => {
  const query = useVaultTotalBalanceQuery()
  const formatFiatAmount = useFormatFiatAmount()
  const { t } = useTranslation()

  return (
    <Container>
      <ImageWrapper>
        <Image
          src="/core/images/defi/homepage-banner.svg"
          width="100%"
          height="100%"
        />
      </ImageWrapper>
      <Content alignItems="center" gap={12}>
        <Text size={18} color="contrast" weight="500">
          DeFi Portfolio
        </Text>
        <MatchQuery
          value={query}
          error={() => t('failed_to_load')}
          pending={() => (
            <HStack gap={6} alignItems="center">
              <Spinner size="1.5em" />
            </HStack>
          )}
          success={value => (
            <Text color="contrast" size={28} centerVertically weight="600">
              <BalanceVisibilityAware size="l">
                {formatFiatAmount(value)}
              </BalanceVisibilityAware>
            </Text>
          )}
        />
        <ManageVaultBalanceVisibility />
      </Content>
    </Container>
  )
}

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 20px;
  border-radius: 16px;
  background: ${getColor('foreground')};
  margin: 0 20px;
  height: 136px;

  @media ${mediaQuery.tabletDeviceAndUp} {
    height: 360px;
  }
`

const Content = styled(VStack)`
  position: relative;
  flex: 1;
  justify-content: center;
`

const ImageWrapper = styled.div`
  width: 100%;
  position: absolute;
  inset: 0;

  & > img {
    object-fit: cover;
  }
`
