import { useTranslation } from 'react-i18next'

import { StepTransition } from '../../../../lib/ui/base/StepTransition'
import { OnBackProp } from '../../../../lib/ui/props'
import { MatchQuery } from '../../../../lib/ui/query/components/MatchQuery'
import { PageHeader } from '../../../../ui/page/PageHeader'
import { PageHeaderTitle } from '../../../../ui/page/PageHeaderTitle'
import { VaultBackupFlow } from '../../../backup/flow/VaultBackupFlow'
import { CurrentVaultProvider } from '../../../state/currentVault'
import { useCreateVaultSetup } from '../../fast/hooks/useCreateVaultSetup'
import { SetupVaultType } from '../../type/SetupVaultType'
import { FailedSetupVaultKeygenStep } from '../FailedSetupVaultKeygenStep'
import { SetupVaultSuccessScreen } from '../SetupVaultSuccessScreen'
import { SetupVaultEducationSlides } from './SetupVaultEducationSlides'

type KeygenStepProps = OnBackProp & {
  onTryAgain: () => void
  vaultType: SetupVaultType
}
export const SetupVaultCreationStep = ({ onTryAgain }: KeygenStepProps) => {
  const state = useCreateVaultSetup()
  const { t } = useTranslation()
  const title = t('creating_vault')

  return (
    <MatchQuery
      value={state}
      success={vault => (
        <CurrentVaultProvider value={vault}>
          <StepTransition
            from={({ onForward }) => (
              <SetupVaultSuccessScreen onForward={onForward} />
            )}
            to={() => <VaultBackupFlow />}
          />
        </CurrentVaultProvider>
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
