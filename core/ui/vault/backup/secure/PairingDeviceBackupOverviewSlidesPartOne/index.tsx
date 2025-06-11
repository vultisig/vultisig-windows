import { useResponsiveness } from '@core/ui/providers/ResponsivenessProivder'
import { useBackupOverviewStepsAnimations } from '@core/ui/vault/backup/secure/PairingDeviceBackupOverviewSlidesPartOne/hooks/useBackupOverviewStepsAnimations'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { VStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { GradientText, Text } from '@lib/ui/text'
import { match } from '@lib/utils/match'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type OnboardingStepsProps = {
  onCompleted: () => void
}

export const PairingDeviceBackupOverviewSlidesPartOne: FC<
  OnboardingStepsProps
> = ({ onCompleted }) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const deviceNumber = vault.signers.length
  const { signers } = vault
  const is5PlusDevice = deviceNumber >= 5
  const {
    animations,
    handleNextAnimation,
    currentAnimation,
    animationComponent: AnimationComponent,
    isLoading,
  } = useBackupOverviewStepsAnimations(signers.length, deviceNumber)
  const { isSmall } = useResponsiveness()

  return (
    <VStack fullHeight>
      <VStack
        alignItems="center"
        gap={16}
        style={{ padding: pageConfig.verticalPadding }}
      >
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
      </VStack>
      <PageContent alignItems="center" flexGrow>
        <AnimationComponent />
      </PageContent>
      <PageFooter alignItems="center" gap={32}>
        {match(currentAnimation, {
          1: () => (
            <AnimatedVisibility>
              <Text as="div" size={isSmall ? 24 : 32} centerHorizontally>
                {t('secureVaultSetup.backup.shares', {
                  shares: vault.signers.length,
                })}{' '}
                <GradientText as="span">
                  {t('secureVaultSetup.backup.eachDeviceNeedsBackup')}
                </GradientText>
              </Text>
            </AnimatedVisibility>
          ),
          2: () => (
            <AnimatedVisibility>
              <Text as="div" size={isSmall ? 24 : 32} centerHorizontally>
                {t('backup')}{' '}
                <GradientText as="span">{t('this_vault_share')}</GradientText>{' '}
                {t('fastVaultSetup.backup.shareSecurely')}{' '}
                <GradientText as="span">
                  {t('fastVaultSetup.backup.shareOnlineBackup')}
                </GradientText>
              </Text>
            </AnimatedVisibility>
          ),
        })}
        <IconButton
          disabled={isLoading}
          kind="primary"
          onClick={
            is5PlusDevice &&
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
