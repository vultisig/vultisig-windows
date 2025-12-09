import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { Button } from '@lib/ui/buttons/Button'
import { Image } from '@lib/ui/image/Image'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { APYOverview } from './components/APYOverview'
import { BalanceOverviewTable } from './components/BalanceOverviewTable'
import { InfoBanner } from './components/InfoBanner'
import { OpenCircleAccount } from './components/OpenCircleAccount'
import { TransactionActions } from './components/TransactionActions'
import { useCircleAccountQuery } from './queries/useCircleAccountQuery'

export const CircleView = () => {
  const { t } = useTranslation()
  const circleAccountQuery = useCircleAccountQuery()

  return (
    <VStack fullHeight>
      <StyledHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('circle_title')}
      />
      <StyledPageContent>
        <Image
          src="/core/images/circle-screen-bg.png"
          alt="register vault"
          width={353}
          height={143}
        />
        <Text size={14} color="shyExtra">
          {t('circle.introduction')}
        </Text>
        <MatchQuery
          value={circleAccountQuery}
          pending={() => <OpenCircleAccount isPending />}
          inactive={() => <OpenCircleAccount />}
          success={circleAccountAddress =>
            circleAccountAddress ? (
              <MainWrapper>
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
      </StyledPageContent>
    </VStack>
  )
}

const StyledHeader = styled(PageHeader)`
  position: relative;
  z-index: 1;
`

const StyledPageContent = styled(PageContent)`
  max-width: 353px;
  margin-inline: auto;

  ${vStack({
    gap: 12,
    flexGrow: true,
  })};
`

const MainWrapper = styled.div`
  padding: 16px;
  border-radius: 16px;
  border: 1px solid ${getColor('foregroundSuper')};
  background: ${getColor('foreground')};

  ${vStack({
    gap: 15,
  })};
`
