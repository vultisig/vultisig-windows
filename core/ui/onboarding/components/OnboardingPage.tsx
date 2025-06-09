import { ProductEnhancedLogo } from '@core/ui/product/logo/ProductEnhancedLogo'
import { useSetHasFinishedOnboardingMutation } from '@core/ui/storage/onboarding'
import { Button } from '@lib/ui/buttons/Button'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ContainImage } from '@lib/ui/images/ContainImage'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { Text } from '@lib/ui/text'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'

type OnboardingStep = {
  artUrl: string
  content: ReactNode
}

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
    <VStack fullHeight>
      <PageContent alignItems="center" gap={60} justifyContent="center">
        <HStack gap={8} alignItems="center">
          <ProductEnhancedLogo fontSize={44} />
          <Text color="contrast" size={36} weight="600">
            {t('vultisig')}
          </Text>
        </HStack>
        <SafeImage
          src={artUrl}
          render={props => (
            <ContainImage {...props} style={{ maxHeight: 260 }} />
          )}
        />
        <Text color="contrast" height="large" centerHorizontally>
          {content}
        </Text>
      </PageContent>
      <PageFooter alignItems="center" gap={24}>
        <MultistepProgressIndicator value={stepIndex} steps={steps.length} />
        <VStack gap={16} fullWidth>
          <Button
            onClick={() =>
              isLastScreen
                ? completeOnboarding()
                : setStepIndex(prev => prev + 1)
            }
          >
            {t('next')}
          </Button>
          <Button kind="secondary" onClick={completeOnboarding}>
            {t('skip')}
          </Button>
        </VStack>
      </PageFooter>
    </VStack>
  )
}
