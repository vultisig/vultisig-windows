import { StepFlow } from '@core/ui/step-flow'
import { useBackupOverviewStepsAnimations } from '@core/ui/vault/backup/secure/BackupOverviewSlidesPartOne/hooks/useBackupOverviewStepsAnimations'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { GradientText, Text } from '@lib/ui/text'
import { match } from '@lib/utils/match'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const BackupOverviewSlidesPartOne: FC<OnFinishProp> = ({ onFinish }) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const {
    animations,
    handleNextAnimation,
    handlePrevAnimation,
    currentAnimation,
    animationComponent: AnimationComponent,
    isLoading,
  } = useBackupOverviewStepsAnimations(vault.signers.length)

  return (
    <StepFlow
      content={<AnimationComponent />}
      footer={
        <>
          <AnimatedVisibility>
            {match(currentAnimation, {
              1: () => (
                <Text as="div" size={28} centerHorizontally>
                  {t('secureVaultSetup.backup.shares', {
                    shares: vault.signers.length,
                  })}{' '}
                  <GradientText as="span">
                    {t('secureVaultSetup.backup.eachDeviceNeedsBackup')}
                  </GradientText>
                </Text>
              ),
              2: () => (
                <Text as="div" size={28} centerHorizontally>
                  {t('backup')}{' '}
                  <GradientText as="span">{t('this_vault_share')}</GradientText>{' '}
                  {t('fastVaultSetup.backup.shareSecurely')}{' '}
                  <GradientText as="span">
                    {t('fastVaultSetup.backup.online')}
                  </GradientText>
                </Text>
              ),
            })}
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
        </>
      }
      header={
        <>
          <HStack justifyContent="space-between">
            <StyledButton
              icon={
                currentAnimation > 1 ? (
                  <ChevronLeftIcon fontSize={18} />
                ) : undefined
              }
              kind="link"
              onClick={currentAnimation > 1 ? handlePrevAnimation : undefined}
              size="sm"
            >
              {t(currentAnimation > 0 ? 'backupShare' : 'vaultOverview')}
            </StyledButton>
          </HStack>
          <MultistepProgressIndicator
            markPreviousStepsAsCompleted
            steps={animations.length}
            value={currentAnimation}
            variant="bars"
          />
        </>
      }
    />
  )
}

const StyledButton = styled(Button)`
  padding: 0;
  width: auto;
`
