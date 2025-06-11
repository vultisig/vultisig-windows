import { AnimationDescription } from '@core/ui/vault/backup/secure/BackupOverviewSlidesPartOne/AnimationDescription'
import { useBackupOverviewStepsAnimations } from '@core/ui/vault/backup/secure/BackupOverviewSlidesPartOne/hooks/useBackupOverviewStepsAnimations'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
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
    <VStack alignItems="center" fullHeight>
      <VStack gap={16}>
        <Text size={18} centerHorizontally>
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
      </VStack>
      <PageContent alignItems="center" flexGrow scrollable>
        <AnimationComponent style={{ flexGrow: 1 }} />
        <AnimationDescription animation={currentAnimation} />
      </PageContent>
      <PageFooter alignItems="center">
        <IconButton
          disabled={isLoading}
          kind="primary"
          onClick={
            currentAnimation !== animations[animations.length - 1]
              ? handleNextAnimation
              : onCompleted
          }
          size="xl"
        >
          <ChevronRightIcon />
        </IconButton>
      </PageFooter>
    </VStack>
  )
}
