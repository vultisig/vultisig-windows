import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Match } from '../../../../lib/ui/base/Match'
import { StepTransition } from '../../../../lib/ui/base/StepTransition'
import { useStepNavigation } from '../../../../lib/ui/hooks/useStepNavigation'
import { appPaths } from '../../../../navigation'
import { SaveVaultStep } from '../../../keygen/shared/SaveVaultStep'
import { useVaults } from '../../../queries/useVaultsQuery'
import { useCurrentVault } from '../../../state/currentVault'
import { SetupVaultSummaryStep } from '../../shared/SetupVaultSummaryStep'
import VaultBackupPage from '../../shared/vaultBackupSettings/VaultBackupPage'
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

export const BackupFastVault = () => {
  const navigate = useNavigate()
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
          onForward={toNextStep}
        />
      )}
      emailVerification={() => <EmailConfirmation onFinish={toNextStep} />}
      backupSlideshowPartTwo={() => (
        <BackupOverviewSlidesPartTwo onCompleted={toNextStep} />
      )}
      backupConfirmation={() => <BackupConfirmation onCompleted={toNextStep} />}
      backupPage={() => <VaultBackupPage onFinish={toNextStep} />}
      backupSuccessfulSlideshow={() =>
        shouldShowBackupSummary ? (
          <StepTransition
            from={({ onForward }) => (
              <SetupVaultSummaryStep onForward={onForward} />
            )}
            to={() => (
              <BackupSuccessSlide
                onCompleted={() => navigate(appPaths.vault)}
              />
            )}
          />
        ) : (
          <BackupSuccessSlide onCompleted={() => navigate(appPaths.vault)} />
        )
      }
    />
  )
}
