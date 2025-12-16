import { TitleHeader } from '@core/ui/flow/TitleHeader'
import { VStack } from '@lib/ui/layout/Stack'
import { fitPageContent } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type CircleWithdrawViewProps = {
  onBack: () => void
}

export const CircleWithdrawView = ({ onBack }: CircleWithdrawViewProps) => {
  const { t } = useTranslation()

  return (
    <VStack flexGrow>
      <TitleHeader title={t('circle.withdraw_header')} onBack={onBack} />
      <Container>
        <ContentWrapper>
          <Text size={18} color="shy" weight="500">
            {t('coming_soon')}
          </Text>
        </ContentWrapper>
      </Container>
    </VStack>
  )
}

const Container = styled.div`
  ${fitPageContent({ contentMaxWidth: 400 })}
`

const ContentWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`
