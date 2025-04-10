import { Match } from '@lib/ui/base/Match'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { OnFinishProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { SaveVaultStep } from '../../../keygen/shared/SaveVaultStep'
import { useVaults } from '../../../queries/useVaultsQuery'
import { useCurrentVault } from '../../../state/currentVault'
import { SetupVaultSummaryStep } from '../../shared/SetupVaultSummaryStep'
import { VaultBackupFlow } from '../../shared/vaultBackupSettings/VaultBackupFlow'
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

export const BackupFastVault = ({ onFinish }: OnFinishProp) => {
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
      backupPage={() => <VaultBackupFlow onFinish={toNextStep} />}
      backupSuccessfulSlideshow={() =>
        shouldShowBackupSummary ? (
          <StepTransition
            from={({ onForward }) => (
              <SetupVaultSummaryStep onForward={onForward} />
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
