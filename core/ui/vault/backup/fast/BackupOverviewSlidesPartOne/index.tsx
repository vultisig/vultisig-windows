import { AnimationDescription } from '@core/ui/vault/backup/fast/BackupOverviewSlidesPartOne/AnimationDescription'
import { useBackupOverviewStepsAnimations } from '@core/ui/vault/backup/fast/BackupOverviewSlidesPartOne/hooks/useBackupOverviewStepsAnimations'
import { RiveWrapper } from '@core/ui/vault/backup/fast/BackupOverviewSlidesPartOne/VaultOverviewSlides.styles'
import {
  BottomItemsWrapper,
  DescriptionWrapper,
  ProgressWrapper,
  Wrapper,
} from '@core/ui/vault/backup/shared/BackupOverviewSlides.styles'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

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
          <IconButton
            disabled={isLoading}
            onClick={
              currentAnimation !== animations[animations.length - 1]
                ? handleNextAnimation
                : onCompleted
            }
            size="xl"
          >
            <ChevronRightIcon />
          </IconButton>
        </BottomItemsWrapper>
      </VStack>
    </Wrapper>
  )
}
