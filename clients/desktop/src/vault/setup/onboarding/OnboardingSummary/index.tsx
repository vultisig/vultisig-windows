import { useRive } from '@rive-app/react-canvas'
import { useTranslation } from 'react-i18next'

import { Button } from '../../../../lib/ui/buttons/Button'
import { useBoolean } from '../../../../lib/ui/hooks/useBoolean'
import { Checkbox } from '../../../../lib/ui/inputs/checkbox/Checkbox'
import { HStack, VStack } from '../../../../lib/ui/layout/Stack'
import { Text } from '../../../../lib/ui/text'
import { useHasFinishedOnboarding } from '../../../../onboarding/hooks/useHasFinishedOnboarding'
import { Wrapper } from './OnboardingSummary.styles'

export const OnboardingSummary = () => {
  const { RiveComponent: RiveOnboardingSummary } = useRive({
    src: '/assets/animations/onboarding-screen/quick_summary.riv',
    autoplay: true,
  })

  const { t } = useTranslation()
  const [, setHasFinishedOnboarding] = useHasFinishedOnboarding()
  const [isChecked, { toggle }] = useBoolean(false)

  return (
    <Wrapper gap={16} data-testid="OnboardingSummary-Wrapper">
      <RiveOnboardingSummary />
      <VStack gap={16}>
        <HStack
          role="button"
          tabIndex={0}
          onClick={toggle}
          alignItems="center"
          gap={8}
        >
          <Checkbox value={isChecked} onChange={() => {}} />
          <Text color="contrast" weight={500} size={14}>
            {t('fastVaultSetup.summary.agreementText')}
          </Text>
        </HStack>
        <Button
          isDisabled={!isChecked}
          onClick={() => setHasFinishedOnboarding(true)}
        >
          {t('fastVaultSetup.summary.ctaText')}
        </Button>
      </VStack>
    </Wrapper>
  )
}
