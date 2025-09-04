import { StepFlow } from '@core/ui/step-flow'
import { useBackupOverviewStepsAnimationsPartTwo } from '@core/ui/vault/backup/fast/BackupOverviewSlidesPartTwo/hooks/useBackupOverviewStepsAnimationsPartTwo'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { OnFinishProp } from '@lib/ui/props'
import { GradientText, Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

export const BackupOverviewSlidesPartTwo: FC<OnFinishProp> = ({ onFinish }) => {
  const { t } = useTranslation()
  const { animationComponent: AnimationComponent, isLoading } =
    useBackupOverviewStepsAnimationsPartTwo()

  return (
    <StepFlow
      content={<AnimationComponent />}
      footer={
        <>
          <AnimatedVisibility>
            <Text size={28} centerHorizontally>
              {t('backup')}{' '}
              <GradientText as="span">{t('this_vault_share')}</GradientText>{' '}
              {t('fastVaultSetup.backup.securely')}{' '}
              <GradientText as="span">
                {t('fastVaultSetup.backup.online')}
              </GradientText>
            </Text>
          </AnimatedVisibility>
          <IconButton
            disabled={isLoading}
            kind="primary"
            onClick={onFinish}
            size="xl"
          >
            <ChevronRightIcon />
          </IconButton>
        </>
      }
      header={
        <>
          <Text size={18}>{t('backupShare2')}</Text>
          <MultistepProgressIndicator
            steps={4}
            value={4}
            variant="bars"
            markPreviousStepsAsCompleted
          />
        </>
      }
    />
  )
}
