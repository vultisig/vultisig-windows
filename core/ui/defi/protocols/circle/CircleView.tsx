import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { VaultHeader } from '@core/ui/vault/components/VaultHeader'
import { Button } from '@lib/ui/buttons/Button'
import { Center } from '@lib/ui/layout/Center'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { truncateId } from '@lib/utils/string/truncate'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { CircleBanner } from './banner/CircleBanner'
import { APYOverview } from './components/APYOverview'
import { BalanceOverviewTable } from './components/BalanceOverviewTable'
import { InfoBanner } from './components/InfoBanner'
import { OpenCircleAccount } from './components/OpenCircleAccount'
import { TransactionActions } from './components/TransactionActions'
import { useCircleAccountQuery } from './queries/circleAccount'

export const CircleView = () => {
  const { t } = useTranslation()
  const circleAccountQuery = useCircleAccountQuery()

  return (
    <VStack flexGrow>
      <VaultHeader primaryControls={<PageHeaderBackButton />} />
      <FitPageContent contentMaxWidth={400}>
        <VStack gap={12} flexGrow>
          <CircleBanner />
          <Text size={14} color="shyExtra">
            {t('circle.introduction')}
          </Text>
          <MatchQuery
            value={circleAccountQuery}
            pending={() => (
              <Center>
                <Spinner />
              </Center>
            )}
            inactive={() => <OpenCircleAccount />}
            success={circleAccountAddress =>
              circleAccountAddress ? (
                <MainWrapper>
                  <p>Circle account: {truncateId(circleAccountAddress)}</p>
                  <Text weight={600}>{t('circle.balance_title')}</Text>
                  <BalanceOverviewTable />
                  <APYOverview />
                  <div />
                  <Button>{t('circle.claim')}</Button>
                  <TransactionActions />
                  <InfoBanner />
                </MainWrapper>
              ) : (
                <OpenCircleAccount />
              )
            }
          />
        </VStack>
      </FitPageContent>
    </VStack>
  )
}

const MainWrapper = styled.div`
  padding: 16px;
  border-radius: 16px;
  border: 1px solid ${getColor('foregroundSuper')};
  background: ${getColor('foreground')};

  ${vStack({
    gap: 15,
  })};
`
