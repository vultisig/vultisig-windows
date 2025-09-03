import { StepFlow } from '@core/ui/step-flow'
import { useBackupOverviewStepsAnimations } from '@core/ui/vault/backup/fast/BackupOverviewSlidesPartOne/hooks/useBackupOverviewStepsAnimations'
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
  const {
    animations,
    handleNextAnimation,
    handlePrevAnimation,
    currentAnimation,
    animationComponent: AnimationComponent,
    isLoading,
  } = useBackupOverviewStepsAnimations()

  return (
    <StepFlow
      content={<AnimationComponent />}
      footer={
        <>
          <AnimatedVisibility>
            {match(currentAnimation, {
              1: () => (
                <Text size={28} centerHorizontally>
                  {t('fastVaultSetup.backup.vaultShares')}{' '}
                  <GradientText as="span">
                    {t('fastVaultSetup.backup.backThemUpNow')}
                  </GradientText>
                </Text>
              ),
              2: () => (
                <Text size={28} centerHorizontally>
                  {t('fastVaultSetup.backup.part1')}{' '}
                  <GradientText as="span">
                    {t('fastVaultSetup.backup.heldByServer')}.
                  </GradientText>
                </Text>
              ),
              3: () => (
                <Text size={28} centerHorizontally>
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
              {t('back')}
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
