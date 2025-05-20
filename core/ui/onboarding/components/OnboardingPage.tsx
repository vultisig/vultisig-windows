import { ProductEnhancedLogo } from '@core/ui/product/logo/ProductEnhancedLogo'
import { useSetHasFinishedOnboardingMutation } from '@core/ui/storage/onboarding'
import { Button } from '@lib/ui/buttons/Button'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ContainImage } from '@lib/ui/images/ContainImage'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack, VStack, vStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { Text, text } from '@lib/ui/text'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type OnboardingStep = {
  artUrl: string
  content: ReactNode
}

const Container = styled.div`
  ${vStack({
    gap: 60,
    alignItems: 'center',
    justifyContent: 'center',
    fullWidth: true,
  })}

  max-width: 320px;
`

const Content = styled.div`
  ${text({
    color: 'contrast',
    height: 'large',
    centerHorizontally: true,
  })}
  min-height: 100px;
`

const ArtContainer = styled.div`
  height: 260px;
`

export const OnboardingPage = () => {
  const { t } = useTranslation()

  const [stepIndex, setStepIndex] = useState(0)

  const { mutateAsync: setHasFinishedOnboarding } =
    useSetHasFinishedOnboardingMutation()

  const completeOnboarding = () => {
    setHasFinishedOnboarding(true)
  }

  const steps: OnboardingStep[] = [
    {
      artUrl: 'assets/images/Onboarding1.svg',
      content: t('onboarding_view1_description'),
    },
    {
      artUrl: 'assets/images/Onboarding2.svg',
      content: t('onboarding_view2_description'),
    },
    {
      artUrl: 'assets/images/Onboarding3.svg',
      content: t('onboarding_view3_description'),
    },
    {
      artUrl: 'assets/images/Onboarding4.svg',
      content: t('onboarding_view4_description'),
    },
  ]

  const { artUrl, content } = steps[stepIndex]

  const isLastScreen = stepIndex === steps.length - 1

  return (
    <PageContent alignItems="center">
      <Container>
        <HStack gap={8} alignItems="center">
          <ProductEnhancedLogo style={{ fontSize: 44 }} />
          <Text color="contrast" size={36} weight="600">
            {t('vultisig')}
          </Text>
        </HStack>
        <ArtContainer>
          <SafeImage
            src={artUrl}
            render={props => <ContainImage {...props} />}
          />
        </ArtContainer>
        <Content>{content}</Content>
        <VStack fullWidth alignItems="center" gap={24}>
          <MultistepProgressIndicator value={stepIndex} steps={steps.length} />
          <VStack fullWidth gap={12}>
            <Button
              onClick={() => {
                if (isLastScreen) {
                  completeOnboarding()
                } else {
                  setStepIndex(prev => prev + 1)
                }
              }}
            >
              {t('next')}
            </Button>
            <Button kind="ghost" onClick={completeOnboarding}>
              {t('skip')}
            </Button>
          </VStack>
        </VStack>
      </Container>
    </PageContent>
  )
}
