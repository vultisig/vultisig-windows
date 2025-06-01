import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import {
  BottomItemsWrapper,
  DescriptionWrapper,
  NextAnimationButton,
  ProgressWrapper,
  Wrapper,
} from '../../shared/BackupOverviewSlides.styles'
import { AnimationDescription } from './AnimationDescription'
import { useBackupOverviewStepsAnimations } from './hooks/useBackupOverviewStepsAnimations'
import { RiveWrapper } from './VaultOverviewSlides.styles'

type OnboardingStepsProps = {
  onCompleted: () => void
}

export const BackupOverviewSlidesPartOne: FC<OnboardingStepsProps> = ({
  onCompleted,
}) => {
  const { t } = useTranslation()

  const {
    animations,
    handleNextAnimation,
    currentAnimation,
    animationComponent: AnimationComponent,
    isLoading,
  } = useBackupOverviewStepsAnimations()

  return (
    <Wrapper>
      <ProgressWrapper gap={16}>
        <Text size={18}>{t('vault_overview')}</Text>
        <MultistepProgressIndicator
          markPreviousStepsAsCompleted
          steps={animations.length}
          stepWidth={`100px`}
          value={animations.indexOf(currentAnimation) + 1}
          variant="bars"
        />
      </ProgressWrapper>
      <VStack justifyContent="space-between" flexGrow>
        <RiveWrapper>
          <AnimationComponent
            style={{
              flexGrow: 1,
            }}
          />
        </RiveWrapper>
        <DescriptionWrapper>
          <AnimationDescription animation={currentAnimation} />
        </DescriptionWrapper>
        <BottomItemsWrapper>
          <NextAnimationButton
            disabled={isLoading}
            icon={<ChevronRightIcon />}
            onClick={
              currentAnimation !== animations[animations.length - 1]
                ? handleNextAnimation
                : onCompleted
            }
          >
            {t('tap')}
          </NextAnimationButton>
        </BottomItemsWrapper>
      </VStack>
    </Wrapper>
  )
}
