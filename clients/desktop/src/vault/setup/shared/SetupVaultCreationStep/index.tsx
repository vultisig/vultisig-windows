import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { StepTransition } from '../../../../lib/ui/base/StepTransition'
import { OnBackProp } from '../../../../lib/ui/props'
import { MatchQuery } from '../../../../lib/ui/query/components/MatchQuery'
import { PageHeader } from '../../../../ui/page/PageHeader'
import { PageHeaderTitle } from '../../../../ui/page/PageHeaderTitle'
import { VaultBackupFlow } from '../../../backup/flow/VaultBackupFlow'
import { hasServerSigner } from '../../../fast/utils/hasServerSigner'
import { useKeygenMutation } from '../../../keygen/shared/mutations/useKeygenMutation'
import { SaveVaultStep } from '../../../keygen/shared/SaveVaultStep'
import { CurrentVaultProvider } from '../../../state/currentVault'
import { SetupVaultType } from '../../type/SetupVaultType'
import { FailedSetupVaultKeygenStep } from '../FailedSetupVaultKeygenStep'
import { SetupVaultSuccessScreen } from '../SetupVaultSuccessScreen'
import { SetupVaultEducationSlides } from './SetupVaultEducationSlides'

type KeygenStepProps = OnBackProp & {
  onTryAgain: () => void
  vaultType: SetupVaultType
}
export const SetupVaultCreationStep = ({ onTryAgain }: KeygenStepProps) => {
  const { mutate: startKeygen, ...keygenMutationState } = useKeygenMutation()
  const { t } = useTranslation()
  const title = t('creating_vault')

  useEffect(startKeygen, [startKeygen])

  return (
    <MatchQuery
      value={keygenMutationState}
      success={vault => (
        <CurrentVaultProvider value={vault}>
          <StepTransition
            from={({ onForward }) => (
              <SetupVaultSuccessScreen onForward={onForward} />
            )}
            to={() => {
              if (hasServerSigner(vault.signers)) {
                return <VaultBackupFlow />
              }

              return (
                <StepTransition
                  from={({ onForward }) => (
                    <SaveVaultStep
                      title={title}
                      value={vault}
                      onForward={onForward}
                    />
                  )}
                  to={() => <VaultBackupFlow />}
                />
              )
            }}
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
