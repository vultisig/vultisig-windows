import { AnimationDescription } from '@core/ui/onboarding/components/AnimationDescriptions'
import { useOnboardingStepsAnimations } from '@core/ui/onboarding/hooks/useOnboardingStepsAnimations'
import { useResponsiveness } from '@core/ui/providers/ResponsivenessProivder'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type OnboardingStepsProps = {
  onCompleteSteps: () => void
}

export const OnboardingSteps: FC<OnboardingStepsProps> = ({
  onCompleteSteps,
}) => {
  const { t } = useTranslation()
  const {
    animations,
    handleNextAnimation,
    handlePrevAnimation,
    currentAnimation,
    animationComponent: AnimationComponent,
    isLoading,
  } = useOnboardingStepsAnimations()
  const { isSmall } = useResponsiveness()

  return (
    <VStack alignItems="center" fullHeight>
      <VStack gap={16}>
        <HStack alignItems="baseline" justifyContent="space-between">
          <HStack
            gap={4}
            style={{
              cursor: 'pointer',
            }}
            alignItems="center"
            role="button"
            tabIndex={0}
            onClick={handlePrevAnimation}
          >
            <ChevronLeftIcon fontSize={14} />
            <Text size={isSmall ? 14 : 18}>{t('back')}</Text>
          </HStack>
          <UnstyledButton onClick={onCompleteSteps}>
            <Text color="shy" size={isSmall ? 14 : 18}>
              {t('skip')}
            </Text>
          </UnstyledButton>
        </HStack>
        <MultistepProgressIndicator
          markPreviousStepsAsCompleted
          steps={animations.length}
          stepWidth="35px"
          value={animations.indexOf(currentAnimation) + 1}
          variant="bars"
        />
      </VStack>
      <PageContent alignItems="center" flexGrow scrollable>
        <AnimationComponent style={{ flexGrow: 1 }} />
        <AnimationDescription animation={currentAnimation} />
      </PageContent>
      <PageFooter>
        <IconButton
          disabled={isLoading}
          onClick={
            currentAnimation !== animations[animations.length - 1]
              ? handleNextAnimation
              : onCompleteSteps
          }
          size="xl"
          type="primary"
        >
          <ChevronRightIcon />
        </IconButton>
      </PageFooter>
    </VStack>
  )
}
