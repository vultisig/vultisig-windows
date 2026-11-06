import { StepTransition } from '@lib/ui/base/StepTransition'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'

import { VaultBackupWithoutPassword } from './VaultBackupWithoutPassword'
import { VaultBackupWithPassword } from './VaultBackupWithPassword'

type VaultBackupFlowProps = OnFinishProp & {
  vaultIds: string[]
  /** Draws the steps from the settings frames; the post-keygen flow keeps its own look. */
  isSettingsLook?: boolean
}

/** Asks whether to encrypt the backup, then saves the chosen vaults' shares. */
export const VaultBackupFlow = ({
  onFinish,
  vaultIds,
  onBack: onPreviousStep,
  isSettingsLook = false,
}: VaultBackupFlowProps & Partial<OnBackProp>) => {
  return (
    <StepTransition
      from={({ onFinish: onPasswordRequest }) => (
        <VaultBackupWithoutPassword
          vaultIds={vaultIds}
          onFinish={onFinish}
          onPasswordRequest={onPasswordRequest}
          onBack={onPreviousStep}
          isSettingsLook={isSettingsLook}
        />
      )}
      to={({ onBack }) => (
        <VaultBackupWithPassword
          vaultIds={vaultIds}
          onFinish={onFinish}
          onBack={onBack}
          isSettingsLook={isSettingsLook}
        />
      )}
    />
  )
}
