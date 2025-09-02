import { useOnboardingStepsAnimations } from '@core/ui/onboarding/hooks/useOnboardingStepsAnimations'
import { useCore } from '@core/ui/state/core'
import { StepFlow } from '@core/ui/step-flow'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { GradientText, Text } from '@lib/ui/text'
import { match } from '@lib/utils/match'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const OnboardingSteps: FC<OnFinishProp> = ({ onFinish }) => {
  const { t } = useTranslation()
  const {
    animations,
    handleNextAnimation,
    handlePrevAnimation,
    currentAnimation,
    animationComponent: AnimationComponent,
    isLoading,
  } = useOnboardingStepsAnimations()
  const { goBack } = useCore()

  return (
    <StepFlow
      content={<AnimationComponent />}
      footer={
        <>
          <AnimatedVisibility>
            {match(currentAnimation, {
              0: () => (
                <Text as="div" size={28} centerHorizontally>
                  {t('sayHelloTo')}{' '}
                  <GradientText as="span">{`${t('vaultShares')},`}</GradientText>{' '}
                  {t('yourNewRecoveryMethod')}
                </Text>
              ),
              1: () => (
                <Text as="div" size={28} centerHorizontally>
                  {t('theyRe')}{' '}
                  <GradientText as="span">{t('splitIntoParts')}</GradientText>{' '}
                  {`${t('toIncreaseSecurity')},`}{' '}
                  <GradientText as="span">
                    {t('removeSinglePointOfFailure')}
                  </GradientText>
                </Text>
              ),
              2: () => (
                <Text as="div" size={28} centerHorizontally>
                  <GradientText as="span">{t('eachDevice')}</GradientText>{' '}
                  {t('inYourVaultHolds')}{' '}
                  <GradientText as="span">{t('oneVaultShare')}</GradientText>
                </Text>
              ),
              3: () => (
                <Text as="div" size={28} centerHorizontally>
                  {t('recoverYourVault')}{' '}
                  <GradientText as="span">
                    {t('deviceLostOrDamaged')}
                  </GradientText>
                </Text>
              ),
              4: () => (
                <Text as="div" size={28} centerHorizontally>
                  <GradientText as="span">
                    {t('alwaysBackUpEachVaultShare')}
                  </GradientText>{' '}
                  {t('separatelyIna')}{' '}
                  <GradientText as="span">
                    {t('differentLocation')}
                  </GradientText>
                </Text>
              ),
              5: () => (
                <Text as="div" size={28} centerHorizontally>
                  {t('theseSharesCollaborate')}{' '}
                  <GradientText as="span">{t('unlockYourVault')}</GradientText>
                </Text>
              ),
            })}
          </AnimatedVisibility>
          <IconButton
            disabled={isLoading}
            kind="primary"
            onClick={
              currentAnimation < animations.length - 1
                ? handleNextAnimation
                : onFinish
            }
            size="xl"
          >
            <ChevronRightIcon />
          </IconButton>
        </>
      }
      header={
        <>
          <HStack justifyContent="space-between">
            <StyledButton
              icon={<ChevronLeftIcon fontSize={18} />}
              kind="link"
              onClick={!currentAnimation ? goBack : handlePrevAnimation}
              size="sm"
            >
              {t('back')}
            </StyledButton>
            <StyledButton kind="link" onClick={onFinish} size="sm">
              {t('skip')}
            </StyledButton>
          </HStack>
          <MultistepProgressIndicator
            markPreviousStepsAsCompleted
            steps={animations.length}
            value={currentAnimation + 1}
            variant="bars"
          />
        </>
      }
    />
  )
}

const StyledButton = styled(Button)`
  padding: 0;
  width: auto;
`
