import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useTranslation } from 'react-i18next'

import { StepTransition } from '../../../../lib/ui/base/StepTransition'
import { OnBackProp } from '../../../../lib/ui/props'
import { MatchQuery } from '../../../../lib/ui/query/components/MatchQuery'
import { PageHeader } from '../../../../ui/page/PageHeader'
import { PageHeaderTitle } from '../../../../ui/page/PageHeaderTitle'
import { BackupFastVault } from '../../fast/backup/BackupFastVault'
import { useCreateVaultSetup } from '../../fast/hooks/useCreateVaultSetup'
import { BackupSecureVault } from '../../secure/backup/BackupSecureVault'
import { SetupVaultType } from '../../type/SetupVaultType'
import { FailedSetupVaultKeygenStep } from '../FailedSetupVaultKeygenStep'
import { SetupVaultSuccessScreen } from '../SetupVaultSuccessScreen'
import { SetupVaultEducationSlides } from './SetupVaultEducationSlides'

type KeygenStepProps = OnBackProp & {
  onTryAgain: () => void
  vaultType: SetupVaultType
}
export const SetupVaultCreationStep = ({
  onTryAgain,
  vaultType,
}: KeygenStepProps) => {
  const { vault, ...state } = useCreateVaultSetup()
  const { t } = useTranslation()
  const title = t('creating_vault')

  return (
    <MatchQuery
      value={state}
      success={() => (
        <StepTransition
          from={({ onForward }) => (
            <SetupVaultSuccessScreen onForward={onForward} />
          )}
          to={() =>
            vaultType === 'fast' ? (
              <BackupFastVault vault={shouldBePresent(vault)} />
            ) : (
              <BackupSecureVault vault={shouldBePresent(vault)} />
            )
          }
        />
      )}
      error={() => (
        <>
          <PageHeader title={<PageHeaderTitle>{title}</PageHeaderTitle>} />
          <FailedSetupVaultKeygenStep onBack={onTryAgain} />;
        </>
      )}
      pending={() => (
        <>
          <PageHeader title={<PageHeaderTitle>{title}</PageHeaderTitle>} />
          <SetupVaultEducationSlides />
        </>
      )}
    />
  )
}
