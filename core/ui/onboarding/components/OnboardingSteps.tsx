import { useOnboardingStepsAnimations } from '@core/ui/onboarding/hooks/useOnboardingStepsAnimations'
import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { applyResponsiveLayoutWidth } from '@lib/ui/css/getResponsiveLayoutWidth'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import { OnFinishProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { GradientText, Text } from '@lib/ui/text'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'
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
    <StyledLayout fullSize justifyContent="space-between">
      <VStack flexGrow>
        <Header gap={16}>
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
        </Header>
        <VStack justifyContent="center" flexGrow alignItems="center">
          <AnimationWrapper>
            <AnimationComponent />
          </AnimationWrapper>
        </VStack>
      </VStack>
      <Footer alignItems="center" gap={32}>
        <AnimatedVisibility>
          <Text as="div" size={28} centerHorizontally>
            <Trans
              i18nKey={`onboarding_step_${currentAnimation}`}
              components={{ g: <GradientText /> }}
            />
          </Text>
        </AnimatedVisibility>
        <IconButton
          disabled={isLoading}
          kind="primary"
          onClick={
            currentAnimation < animations.length
              ? handleNextAnimation
              : onFinish
          }
          size="xl"
        >
          <ChevronRightIcon />
        </IconButton>
      </Footer>
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

const Header = styled(VStack)`
  @media ${mediaQuery.mobileDeviceAndDown} {
    padding: 36px 24px 0;
  }
`

const Footer = styled(VStack)`
  @media ${mediaQuery.mobileDeviceAndDown} {
    padding: 0 24px 36px;
  }
`

const StyledLayout = styled(VStack)`
  margin: 0 auto;
  position: relative;
  padding-block: ${pageConfig.verticalPadding}px;
  ${applyResponsiveLayoutWidth};
`
