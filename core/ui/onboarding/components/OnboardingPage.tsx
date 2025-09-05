import { useSetHasFinishedOnboardingMutation } from '@core/ui/storage/onboarding'
import { Button } from '@lib/ui/buttons/Button'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { VultisigLogoIcon } from '@lib/ui/icons/VultisigLogoIcon'
import { ContainImage } from '@lib/ui/images/ContainImage'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

const steps = [1, 2, 3, 4] as const

export const OnboardingPage = () => {
  const { step, toNextStep } = useStepNavigation({ steps })
  const { mutate } = useSetHasFinishedOnboardingMutation()
  const { t } = useTranslation()
  const lastStep = steps.length

  return (
    <VStack flexGrow fullHeight justifyContent="flex-end">
      <PageContent
        alignItems="center"
        gap={60}
        justifyContent="center"
        flexGrow
      >
        <HStack gap={8}>
          <VultisigLogoIcon fontSize={44} />
          <Text color="contrast" size={36} weight="600">
            {t('vultisig')}
          </Text>
        </HStack>
        <SafeImage
          src={`core/images/onboarding-${step}.svg`}
          render={props => (
            <ContainImage {...props} style={{ maxHeight: 260 }} />
          )}
        />
        <Text color="contrast" height="large" centerHorizontally>
          {t(`onboarding_description_${step}`)}
        </Text>
      </PageContent>
      <PageFooter alignItems="center" gap={24}>
        <MultistepProgressIndicator value={step - 1} steps={lastStep} />
        <VStack gap={16} fullWidth>
          <Button
            onClick={() => (step === lastStep ? mutate(true) : toNextStep())}
          >
            {t('next')}
          </Button>
          <Button kind="secondary" onClick={() => mutate(true)}>
            {t('skip')}
          </Button>
        </VStack>
      </PageFooter>
    </VStack>
  )
}
