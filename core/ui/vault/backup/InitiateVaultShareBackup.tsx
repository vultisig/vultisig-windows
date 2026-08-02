import { StepTransition } from '@lib/ui/base/StepTransition'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { ReactNode } from 'react'

import { useCurrentVault } from '../state/currentVault'
import { SaveBackupToCloudScreen } from './fast/SaveBackupToCloudScreen'
import { VaultBackupFlow } from './VaultBackupFlow'

type InitiateVaultShareBackupProps = OnFinishProp &
  Partial<OnBackProp> & {
    title?: string
    description?: ReactNode
  }

/**
 * Backs up this device's vault share: first the save-the-backup guidance
 * screen, then the password options. The share file is only written once the
 * user has chosen whether to encrypt it, so no backup can leave the app
 * unprotected without an explicit decision.
 */
export const InitiateVaultShareBackup = ({
  onFinish,
  onBack,
  title,
  description,
}: InitiateVaultShareBackupProps) => {
  const vault = useCurrentVault()

  return (
    <StepTransition
      from={({ onFinish: onPasswordOptions }) => (
        <SaveBackupToCloudScreen
          onBack={onBack}
          onContinue={onPasswordOptions}
          title={title}
          description={description}
        />
      )}
      to={({ onBack: onPreviousStep }) => (
        <VaultBackupFlow
          vaultIds={[getVaultId(vault)]}
          onFinish={onFinish}
          onBack={onPreviousStep}
        />
      )}
    />
  )
}
