import { AnimationDescription } from '@core/ui/vault/backup/secure/BackupOverviewSlidesPartOne/AnimationDescription'
import { useBackupOverviewStepsAnimations } from '@core/ui/vault/backup/secure/BackupOverviewSlidesPartOne/hooks/useBackupOverviewStepsAnimations'
import { RiveWrapper } from '@core/ui/vault/backup/secure/BackupOverviewSlidesPartOne/VaultOverviewSlides.styles'
import {
  BottomItemsWrapper,
  DescriptionWrapper,
  ProgressWrapper,
  Wrapper,
} from '@core/ui/vault/backup/shared/BackupOverviewSlides.styles'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
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
  const vault = useCurrentVault()
  const { signers } = vault
  const {
    animations,
    handleNextAnimation,
    currentAnimation,
    animationComponent: AnimationComponent,
    isLoading,
  } = useBackupOverviewStepsAnimations(signers.length)

  return (
    <Wrapper>
      <ProgressWrapper gap={16}>
        <Text size={18}>
          {t(
            animations.indexOf(currentAnimation) === 0
              ? 'vaultOverview'
              : 'backupShare'
          )}
        </Text>
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
          >
            <ChevronRightIcon />
          </IconButton>
        </BottomItemsWrapper>
      </VStack>
    </Wrapper>
  )
}
