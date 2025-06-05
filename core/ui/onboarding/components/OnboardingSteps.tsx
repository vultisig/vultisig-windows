import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { useResponsiveness } from '../../providers/ResponsivenessProivder'
import {
  BottomItemsWrapper,
  DescriptionWrapper,
  NextAnimationButton,
} from '../../vault/backup/shared/BackupOverviewSlides.styles'
import { useOnboardingStepsAnimations } from '../hooks/useOnboardingStepsAnimations'
import { AnimationDescription } from './AnimationDescriptions'
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

  const { isSmall } = useResponsiveness()

  return (
    <PageContent flexGrow style={{ overflowY: 'hidden' }}>
      <VStack gap={16} style={{ marginInline: 'auto' }}>
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
      <VStack justifyContent="space-between" flexGrow>
        <RiveWrapper
          isLastAnimation={currentAnimation === animations.length - 1}
        >
          <AnimationComponent
            style={{
              flex: 1,
            }}
          />
        </RiveWrapper>
        <DescriptionWrapper>
          <AnimationDescription animation={currentAnimation} />
        </DescriptionWrapper>
        <BottomItemsWrapper>
          <NextAnimationButton
            disabled={isLoading}
            onClick={
              currentAnimation !== animations[animations.length - 1]
                ? handleNextAnimation
                : onCompleteSteps
            }
          >
            <ChevronRightIcon />
          </NextAnimationButton>
        </BottomItemsWrapper>
      </VStack>
    </PageContent>
  )
}
