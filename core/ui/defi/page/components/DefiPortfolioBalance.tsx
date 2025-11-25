import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { ManageVaultBalanceVisibility } from '@core/ui/vault/page/balance/visibility/ManageVaultBalanceVisibility'
import { useVaultTotalBalanceQuery } from '@core/ui/vault/queries/useVaultTotalBalanceQuery'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { DefiPortfolioIcons } from './DefiPortfolioIcons'

export const DefiPortfolioBalance = () => {
  const query = useVaultTotalBalanceQuery()
  const formatFiatAmount = useFormatFiatAmount()
  const { t } = useTranslation()

  return (
    <Container>
      <DefiPortfolioIcons />
      <VStack alignItems="center" gap={12}>
        <Text size={14} color="contrast" weight="500">
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
  background: ${getColor('foreground')};
  margin: 0 20px;
`
