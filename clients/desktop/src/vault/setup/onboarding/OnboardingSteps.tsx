import { IconButton } from '@lib/ui/buttons/IconButton'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { PageContent } from '../../../ui/page/PageContent'
import { AnimationDescription } from './AnimationDescriptions'
import { useOnboardingStepsAnimations } from './hooks/useOnboardingStepsAnimations'
import { RiveWrapper } from './Onobarding.styled'

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

  return (
    <PageContent style={{ overflowY: 'hidden' }}>
      <ProgressWrapper gap={16}>
        <HStack justifyContent="space-between" alignItems="baseline">
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
            <ChevronLeftIcon width={24} height={24} />
            <Text size={18}>{t('back')}</Text>
          </HStack>
          <UnstyledButton onClick={onCompleteSteps}>
            <Text color="shy" size={18}>
              {t('skip')}
            </Text>
          </UnstyledButton>
        </HStack>
        <MultistepProgressIndicator
          markPreviousStepsAsCompleted
          steps={animations.length}
          stepWidth={`100px`}
          value={animations.indexOf(currentAnimation) + 1}
          variant="bars"
        />
      </ProgressWrapper>
      <ContentWrapper justifyContent="space-between" flexGrow>
        <RiveWrapper
          isLastAnimation={currentAnimation === animations.length - 1}
        >
          <AnimationComponent />
        </RiveWrapper>
        <VStack gap={12}>
          <AnimationDescription animation={currentAnimation} />
          <NextAnimationButton
            disabled={isLoading}
            icon={<ChevronRightIcon />}
            onClick={
              currentAnimation !== animations[animations.length - 1]
                ? handleNextAnimation
                : onCompleteSteps
            }
          >
            {t('tap')}
          </NextAnimationButton>
        </VStack>
      </ContentWrapper>
    </PageContent>
  )
}

const NextAnimationButton = styled(IconButton)`
  flex-shrink: 0;
  width: 84px;
  height: 48px;
  border-radius: 99px;
  background-color: ${getColor('primary')};
  align-self: center;

  &:hover {
    background-color: ${getColor('primary')};
  }

  & svg {
    stroke: ${getColor('textDark')};
  }
`

const ProgressWrapper = styled(VStack)`
  margin-inline: auto;
  margin-top: 48px;
`

const ContentWrapper = styled(VStack)`
  margin-inline: auto;
`
