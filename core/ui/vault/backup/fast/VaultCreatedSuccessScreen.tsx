import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Animation } from '@lib/ui/animations/Animation'
import { Button } from '@lib/ui/buttons/Button'
import { ShieldCheckFilledIcon } from '@lib/ui/icons/ShieldCheckFilledIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { GradientText, Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const VaultCreatedSuccessScreen = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <Container fullHeight justifyContent="center" alignItems="center">
      <AnimationWrapper>
        <Animation src="/core/animations/onboarding-success.riv" />
      </AnimationWrapper>
      <ContentSection>
        <VStack gap={8} alignItems="center">
          <IconWrapper>
            <ShieldCheckFilledIcon style={{ fontSize: 20, color: '#13C89D' }} />
          </IconWrapper>
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
          <Button onClick={() => navigate({ id: 'vault' })}>
            {t('go_to_wallet')}
          </Button>
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

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #03132c;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.25) inset;
  display: flex;
  align-items: center;
  justify-content: center;
`

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
