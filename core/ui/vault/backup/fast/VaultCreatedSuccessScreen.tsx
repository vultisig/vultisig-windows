import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Animation } from '@lib/ui/animations/Animation'
import { Button } from '@lib/ui/buttons/Button'
import { Divider } from '@lib/ui/divider'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnFinishProp } from '@lib/ui/props'
import { GradientText, Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const VaultCreatedSuccessScreen = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <Container fullHeight justifyContent="center" alignItems="center">
      <AnimationWrapper>
        <Animation src="/core/animations/onboarding-success.riv" />
      </AnimationWrapper>
      <ContentSection>
        <VStack gap={8} alignItems="center">
          <GradientText size={22} weight={500}>
            {t('congrats')}
          </GradientText>
          <Text size={22} weight={500} color="contrast" centerHorizontally>
            {t('vault_ready_to_use')}
          </Text>
          <Text size={14} color="shy" centerHorizontally>
            {t('vault_ready_description')}
          </Text>
        </VStack>
        <VStack gap={16}>
          <Button onClick={onFinish}>{t('go_to_wallet')}</Button>
          <Divider text={t('or').toUpperCase()} />
          <Button
            kind="secondary"
            onClick={() => navigate({ id: 'manageVaultChains' })}
          >
            {t('choose_chains')}
          </Button>
        </VStack>
      </ContentSection>
    </Container>
  )
}

const Container = styled(PageContent)`
  gap: 0;
`

const AnimationWrapper = styled.div`
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow: hidden;
`

const ContentSection = styled(VStack)`
  width: min(345px, 100%);
  padding: 0 24px 24px;
  flex-shrink: 0;
  gap: 32px;
`
