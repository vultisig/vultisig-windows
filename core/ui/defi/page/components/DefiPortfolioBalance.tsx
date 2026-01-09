import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { useDefiPortfolioBalance } from '@core/ui/defi/page/hooks/useDefiPortfolios'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { ManageVaultBalanceVisibility } from '@core/ui/vault/page/balance/visibility/ManageVaultBalanceVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const DefiPortfolioBalance = () => {
  const query = useDefiPortfolioBalance()
  const formatFiatAmount = useFormatFiatAmount()
  const { t } = useTranslation()

  return (
    <Container>
      <BlurEffect />
      <VStack
        alignItems="center"
        gap={12}
        justifyContent="center"
        position="relative"
        flexGrow
      >
        <MatchQuery
          value={query}
          error={() => t('failed_to_load')}
          pending={() => (
            <HStack gap={6} alignItems="center">
              <Spinner size="1.5em" />
            </HStack>
          )}
          success={value => (
            <Text size={34}>
              <BalanceVisibilityAware size="l">
                {formatFiatAmount(value)}
              </BalanceVisibilityAware>
            </Text>
          )}
        />
        <ManageVaultBalanceVisibility
          hideText={t('hide_defi_balance')}
          showText={t('show_defi_balance')}
        />
      </VStack>
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
  margin: 0 20px;
  height: 136px;

  @media ${mediaQuery.tabletDeviceAndUp} {
    height: 360px;
  }
`

const BlurEffect = styled.div`
  position: absolute;
  border-radius: 16px;
  border-radius: 350px;
  top: -30px;
  height: 200px;
  width: 450px;
  opacity: 0.7;
  background: radial-gradient(
    50% 50% at 50% 50%,
    rgba(4, 57, 199, 0.5) 0%,
    rgba(2, 18, 43, 0) 100%
  );
  filter: blur(36px);

  @media ${mediaQuery.tabletDeviceAndUp} {
    height: 450px;
    width: 600px;
    top: -50px;
  }
`
