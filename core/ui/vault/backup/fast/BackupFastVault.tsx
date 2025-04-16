import { SaveVaultStep } from '@core/ui/vault/save/SaveVaultStep'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useVaults } from '@core/ui/vault/state/vaults'
import { Match } from '@lib/ui/base/Match'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { VaultBackupFlow } from '../VaultBackupFlow'
import { VaultBackupSummaryStep } from '../VaultBackupSummaryStep'
import { EmailConfirmation } from '.'
import { BackupConfirmation } from './BackupConfirmation'
import { BackupOverviewSlidesPartOne } from './BackupOverviewSlidesPartOne'
import { BackupOverviewSlidesPartTwo } from './BackupOverviewSlidesPartTwo'
import { BackupSuccessSlide } from './BackupSuccessSlides'

const steps = [
  'backupSlideshowPartOne',
  'emailVerification',
  'saveVault',
  'backupSlideshowPartTwo',
  'backupConfirmation',
  'backupPage',
  'backupSuccessfulSlideshow',
] as const

export const BackupFastVault = ({
  onFinish,
  onBack,
}: OnFinishProp & OnBackProp) => {
  const { step, toNextStep } = useStepNavigation({
    steps,
  })
  const vaults = useVaults()
  // @antonio: by design we only need to show the summary step if user has more than 2 vaults
  const shouldShowBackupSummary = vaults.length > 1

  const { t } = useTranslation()

  const vault = useCurrentVault()

  return (
    <Match
      value={step}
      backupSlideshowPartOne={() => (
        <BackupOverviewSlidesPartOne onCompleted={toNextStep} />
      )}
      saveVault={() => (
        <SaveVaultStep
          value={vault}
          title={t('creating_vault')}
          onFinish={toNextStep}
          onBack={onBack}
        />
      )}
      emailVerification={() => <EmailConfirmation onFinish={toNextStep} />}
      backupSlideshowPartTwo={() => (
        <BackupOverviewSlidesPartTwo onCompleted={toNextStep} />
      )}
      backupConfirmation={() => <BackupConfirmation onCompleted={toNextStep} />}
      backupPage={() => <VaultBackupFlow onFinish={toNextStep} />}
      backupSuccessfulSlideshow={() =>
        shouldShowBackupSummary ? (
          <StepTransition
            from={({ onFinish }) => (
              <VaultBackupSummaryStep onFinish={onFinish} />
            )}
            to={() => <BackupSuccessSlide onCompleted={onFinish} />}
          />
        ) : (
          <BackupSuccessSlide onCompleted={onFinish} />
        )
      }
    />
  )
}
