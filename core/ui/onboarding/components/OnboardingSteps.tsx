import { useOnboardingStepsAnimations } from '@core/ui/onboarding/hooks/useOnboardingStepsAnimations'
import { useResponsiveness } from '@core/ui/providers/ResponsivenessProivder'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { pageConfig } from '@lib/ui/page/config'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { GradientText, Text } from '@lib/ui/text'
import { match } from '@lib/utils/match'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const StyledButton = styled(Button)`
  padding: 0;
  width: auto;
`

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
  const navigateBack = useNavigateBack()

  return (
    <>
      <VStack
        alignItems="center"
        style={{ padding: pageConfig.verticalPadding }}
      >
        <VStack gap={16}>
          <HStack justifyContent="space-between">
            <StyledButton
              icon={<ChevronLeftIcon fontSize={18} />}
              kind="link"
              onClick={!currentAnimation ? navigateBack : handlePrevAnimation}
              size="sm"
            >
              {t('back')}
            </StyledButton>
            <StyledButton kind="link" onClick={onCompleteSteps} size="sm">
              {t('skip')}
            </StyledButton>
          </HStack>
          <MultistepProgressIndicator
            markPreviousStepsAsCompleted
            steps={animations.length}
            stepWidth="35px"
            value={animations.indexOf(currentAnimation) + 1}
            variant="bars"
          />
        </VStack>
      </VStack>
      <PageContent alignItems="center" flexGrow>
        <AnimationComponent />
      </PageContent>
      <PageFooter alignItems="center" gap={32}>
        {match(currentAnimation, {
          0: () => (
            <AnimatedVisibility>
              <Text as="div" size={isSmall ? 24 : 32} centerHorizontally>
                {t('sayHelloTo')}{' '}
                <GradientText as="span">{t('vaultShares')},</GradientText>{' '}
                {t('yourNewRecoveryMethod')}
              </Text>
            </AnimatedVisibility>
          ),
          1: () => (
            <AnimatedVisibility>
              <Text as="div" size={isSmall ? 24 : 32} centerHorizontally>
                {t('theyRe')}{' '}
                <GradientText as="span">{t('splitIntoParts')}</GradientText>{' '}
                {t('toIncreaseSecurity')}{' '}
                <GradientText as="span">
                  {t('removeSinglePointOfFailure')}
                </GradientText>
              </Text>
            </AnimatedVisibility>
          ),
          2: () => (
            <AnimatedVisibility>
              <Text as="div" size={isSmall ? 24 : 32} centerHorizontally>
                <GradientText as="span">{t('eachDevice')}</GradientText>{' '}
                {t('inYourVaultHolds')}{' '}
                <GradientText as="span">{t('oneVaultShare')}</GradientText>
              </Text>
            </AnimatedVisibility>
          ),
          3: () => (
            <AnimatedVisibility>
              <Text as="div" size={isSmall ? 24 : 32} centerHorizontally>
                {t('recoverYourVault')}{' '}
                <GradientText as="span">
                  {t('deviceLostOrDamaged')}
                </GradientText>
              </Text>
            </AnimatedVisibility>
          ),
          4: () => (
            <AnimatedVisibility>
              <Text as="div" size={isSmall ? 24 : 32} centerHorizontally>
                <GradientText as="span">
                  {t('alwaysBackUpEachVaultShare')}
                </GradientText>{' '}
                {t('separatelyIna')}{' '}
                <GradientText as="span">{t('differentLocation')}</GradientText>
              </Text>
            </AnimatedVisibility>
          ),
          5: () => (
            <AnimatedVisibility>
              <Text as="div" size={isSmall ? 24 : 32} centerHorizontally>
                {t('theseSharesCollaborate')}{' '}
                <GradientText as="span">{t('unlockYourVault')}</GradientText>
              </Text>
            </AnimatedVisibility>
          ),
        })}
        <IconButton
          disabled={isLoading}
          kind="primary"
          onClick={
            currentAnimation < animations.length - 1
              ? handleNextAnimation
              : onCompleteSteps
          }
          size="xl"
        >
          <ChevronRightIcon />
        </IconButton>
      </PageFooter>
    </>
  )
}
