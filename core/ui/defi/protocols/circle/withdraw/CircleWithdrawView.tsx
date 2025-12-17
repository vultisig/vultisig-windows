import { TitleHeader } from '@core/ui/flow/TitleHeader'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { CirclePageContainer } from '../CirclePageContainer'
import { useCircleViewState } from '../state/circleViewState'

export const CircleWithdrawView = () => {
  const { t } = useTranslation()
  const [, setViewState] = useCircleViewState()

  return (
    <>
      <TitleHeader
        title={t('circle.withdraw_header')}
        onBack={() => setViewState('home')}
      />
      <CirclePageContainer>
        <ContentWrapper>
          <Text size={18} color="shy" weight="500">
            {t('coming_soon')}
          </Text>
        </ContentWrapper>
      </CirclePageContainer>
    </>
  )
}

const ContentWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`
