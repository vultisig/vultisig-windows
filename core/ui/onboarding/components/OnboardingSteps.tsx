import { useOnboardingStepsAnimations } from '@core/ui/onboarding/hooks/useOnboardingStepsAnimations'
import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import { OnFinishProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
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
    <StyledLayout fullSize justifyContent="space-between">
      <VStack flexGrow>
        <VStack gap={16}>
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
        </VStack>
        <VStack justifyContent="center" flexGrow alignItems="center">
          <AnimationWrapper>
            <AnimationComponent />
          </AnimationWrapper>
        </VStack>
      </VStack>
      <VStack alignItems="center" gap={32}>
        <AnimatedVisibility>
          {match(currentAnimation, {
            0: () => (
              <>
                <Text as="div" size={fontSize} centerHorizontally>
                  {t('sayHelloTo')}{' '}
                  <GradientText as="span">{`${t('vaultShares')},`}</GradientText>{' '}
                  {t('yourNewRecoveryMethod')}
                </Text>
              </>
            ),
            1: () => (
              <>
                <Text as="div" size={fontSize} centerHorizontally>
                  {t('theyRe')}{' '}
                  <GradientText as="span">{t('splitIntoParts')}</GradientText>{' '}
                  {`${t('toIncreaseSecurity')},`}{' '}
                  <GradientText as="span">
                    {t('removeSinglePointOfFailure')}
                  </GradientText>
                </Text>
              </>
            ),
            2: () => (
              <>
                <Text as="div" size={fontSize} centerHorizontally>
                  <GradientText as="span">{t('eachDevice')}</GradientText>{' '}
                  {t('inYourVaultHolds')}{' '}
                  <GradientText as="span">{t('oneVaultShare')}</GradientText>
                </Text>
              </>
            ),
            3: () => (
              <>
                <Text as="div" size={fontSize} centerHorizontally>
                  {t('recoverYourVault')}{' '}
                  <GradientText as="span">
                    {t('deviceLostOrDamaged')}
                  </GradientText>
                </Text>
              </>
            ),
            4: () => (
              <>
                <Text as="div" size={28} centerHorizontally>
                  <GradientText as="span">
                    {t('alwaysBackUpEachVaultShare')}
                  </GradientText>{' '}
                  {t('separatelyIna')}{' '}
                  <GradientText as="span">
                    {t('differentLocation')}
                  </GradientText>
                </Text>
              </>
            ),
            5: () => (
              <>
                <Text as="div" size={28} centerHorizontally>
                  {t('theseSharesCollaborate')}{' '}
                  <GradientText as="span">{t('unlockYourVault')}</GradientText>
                </Text>
              </>
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
      </VStack>
    </StyledLayout>
  )
}

const StyledButton = styled(Button)`
  padding: 0;
  width: auto;
`

const AnimationWrapper = styled.div`
  position: relative;
  width: 100%;
  flex: 1;

  @media ${mediaQuery.mobileDeviceAndDown} {
    max-height: 380px;
  }

  @media ${mediaQuery.tabletDeviceAndUp} {
    max-height: 650px;
  }

  @media ${mediaQuery.desktopDeviceAndUp} {
    max-height: 750px;
  }
`

const StyledLayout = styled(VStack)`
  margin: 0 auto;
  position: relative;
  padding-block: ${pageConfig.verticalPadding}px;

  @media ${mediaQuery.mobileDeviceAndDown} {
    width: calc(100% - ${pageConfig.horizontalPadding * 2}px);
  }

  @media ${mediaQuery.tabletDeviceAndUp} {
    width: 750px;
  }

  @media ${mediaQuery.desktopDeviceAndUp} {
    width: 800px;
  }
`
