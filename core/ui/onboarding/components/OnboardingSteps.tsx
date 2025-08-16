import { useOnboardingStepsAnimations } from '@core/ui/onboarding/hooks/useOnboardingStepsAnimations'
import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
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
  const fontSize = 28

  return (
    <StyledLayout maxWidth={400} fullSize>
      <StyledHeader gap={16}>
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
          value={animations.indexOf(currentAnimation) + 1}
          variant="bars"
        />
      </StyledHeader>
      <StyledContent alignItems="center">
        <AnimationComponent />
      </StyledContent>
      <StyledFooter alignItems="center" gap={32}>
        {match(currentAnimation, {
          0: () => (
            <AnimatedVisibility>
              <Text as="div" size={fontSize} centerHorizontally>
                {t('sayHelloTo')}{' '}
                <GradientText as="span">{`${t('vaultShares')},`}</GradientText>{' '}
                {t('yourNewRecoveryMethod')}
              </Text>
            </AnimatedVisibility>
          ),
          1: () => (
            <AnimatedVisibility>
              <Text as="div" size={fontSize} centerHorizontally>
                {t('theyRe')}{' '}
                <GradientText as="span">{t('splitIntoParts')}</GradientText>{' '}
                {`${t('toIncreaseSecurity')},`}{' '}
                <GradientText as="span">
                  {t('removeSinglePointOfFailure')}
                </GradientText>
              </Text>
            </AnimatedVisibility>
          ),
          2: () => (
            <AnimatedVisibility>
              <Text as="div" size={fontSize} centerHorizontally>
                <GradientText as="span">{t('eachDevice')}</GradientText>{' '}
                {t('inYourVaultHolds')}{' '}
                <GradientText as="span">{t('oneVaultShare')}</GradientText>
              </Text>
            </AnimatedVisibility>
          ),
          3: () => (
            <AnimatedVisibility>
              <Text as="div" size={fontSize} centerHorizontally>
                {t('recoverYourVault')}{' '}
                <GradientText as="span">
                  {t('deviceLostOrDamaged')}
                </GradientText>
              </Text>
            </AnimatedVisibility>
          ),
          4: () => (
            <AnimatedVisibility>
              <Text as="div" size={28} centerHorizontally>
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
              <Text as="div" size={28} centerHorizontally>
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
              : onFinish
          }
          size="xl"
        >
          <ChevronRightIcon />
        </IconButton>
      </StyledFooter>
    </StyledLayout>
  )
}

const StyledButton = styled(Button)`
  padding: 0;
  width: auto;
`

const StyledContent = styled(VStack)`
  height: 400px;
  padding: 0;
`

const StyledFooter = styled(VStack)`
  bottom: 0px;
  padding: 0 24px 36px;
  position: absolute;
`

const StyledHeader = styled(VStack)`
  padding: 36px 24px 0;
`

const StyledLayout = styled(VStack)`
  margin: 0 auto;
  position: relative;
`
