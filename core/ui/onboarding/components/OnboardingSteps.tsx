import { useOnboardingStepsAnimations } from '@core/ui/onboarding/hooks/useOnboardingStepsAnimations'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { GradientText, Text } from '@lib/ui/text'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const OnboardingSteps: FC<OnFinishProp & OnBackProp> = ({
  onFinish,
  onBack,
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

  const handleBack = () => {
    if (!currentAnimation || currentAnimation === 1) {
      onBack()
    } else {
      handlePrevAnimation()
    }
  }

  return (
    <Layout>
      <HeaderSection gap={16}>
        <HStack justifyContent="space-between" fullWidth>
          <StyledButton
            icon={<ChevronLeftIcon fontSize={18} />}
            kind="link"
            onClick={handleBack}
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
      </HeaderSection>
      <AnimationArea>
        <AnimationWrapper>
          <AnimationComponent />
        </AnimationWrapper>
      </AnimationArea>
      <FooterSection>
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
      </FooterSection>
    </Layout>
  )
}

const StyledButton = styled(Button)`
  padding: 0;
  width: auto;
`

const Layout = styled(VStack)`
  height: 100%;
  width: min(1100px, 100%);
  margin: 0 auto;
  padding: ${pageConfig.verticalPadding}px ${pageConfig.horizontalPadding}px;
  gap: 32px;
  overflow: hidden;
  align-items: stretch;
`

const HeaderSection = styled(VStack)`
  width: min(640px, 100%);
  align-self: center;
  align-items: center;

  @media ${mediaQuery.mobileDeviceAndDown} {
    padding: 36px 24px 0;
  }
`

const AnimationArea = styled(VStack)`
  flex: 1;
  min-height: 0;
  align-items: center;
  justify-content: center;
  width: 100%;
`

const AnimationWrapper = styled.div`
  width: 100%;
  height: 100%;
  max-width: 880px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  min-height: 0;

  canvas,
  img,
  video {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain;
  }

  @media ${mediaQuery.mobileDeviceAndDown} {
    max-width: 100%;
    height: 320px;
  }
`

const FooterSection = styled(VStack)`
  width: min(640px, 100%);
  align-self: center;
  align-items: center;
  gap: 32px;
  flex-shrink: 0;

  @media ${mediaQuery.mobileDeviceAndDown} {
    padding: 0 24px 36px;
  }
`
