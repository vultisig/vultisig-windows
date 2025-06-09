import { useBackupOverviewStepsAnimations } from '@core/ui/vault/backup/fast/BackupOverviewSlidesPartOne/hooks/useBackupOverviewStepsAnimations'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { VStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { useIsTabletDeviceAndUp } from '@lib/ui/responsive/mediaQuery'
import { GradientText, Text } from '@lib/ui/text'
import { match } from '@lib/utils/match'
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
  const isLargeDevice = useIsTabletDeviceAndUp()
  const fontSize = isLargeDevice ? 32 : 24

  return (
    <VStack fullHeight>
      <VStack
        alignItems="center"
        gap={16}
        style={{ padding: pageConfig.verticalPadding }}
      >
        <Text size={18}>{t('vault_overview')}</Text>
        <MultistepProgressIndicator
          markPreviousStepsAsCompleted
          steps={animations.length}
          stepWidth={`100px`}
          value={animations.indexOf(currentAnimation) + 1}
          variant="bars"
        />
      </VStack>
      <PageContent alignItems="center" flexGrow>
        <AnimationComponent />
      </PageContent>
      <PageFooter alignItems="center" gap={32}>
        <AnimatedVisibility>
          {match(currentAnimation, {
            1: () => (
              <Text size={fontSize} centerHorizontally>
                {t('fastVaultSetup.backup.vaultShares')}{' '}
                <GradientText as="span">
                  {t('fastVaultSetup.backup.backThemUpNow')}
                </GradientText>
              </Text>
            ),
            2: () => (
              <Text size={fontSize} centerHorizontally>
                {t('fastVaultSetup.backup.part1')}{' '}
                <GradientText as="span">
                  {t('fastVaultSetup.backup.heldByServer')}.
                </GradientText>
              </Text>
            ),
            3: () => (
              <Text size={fontSize} centerHorizontally>
                {t('fastVaultSetup.backup.completeCustody')}{' '}
                <GradientText as="span">
                  {t('fastVaultSetup.backup.checkEmail')}
                </GradientText>
              </Text>
            ),
          })}
        </AnimatedVisibility>
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
