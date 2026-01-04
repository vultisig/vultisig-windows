import { StepTransition } from '@lib/ui/base/StepTransition'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'

import { VaultBackupWithoutPassword } from './VaultBackupWithoutPassword'
import { VaultBackupWithPassword } from './VaultBackupWithPassword'

type VaultBackupFlowProps = OnFinishProp & { vaultIds: string[] }

export const VaultBackupFlow = ({
  onFinish,
  vaultIds,
  onBack: onPreviousStep,
}: VaultBackupFlowProps & Partial<OnBackProp>) => {
  return (
    <StepTransition
      from={({ onFinish: onPasswordRequest }) => (
        <VaultBackupWithoutPassword
          vaultIds={vaultIds}
          onFinish={onFinish}
          onPasswordRequest={onPasswordRequest}
          onBack={onPreviousStep}
        />
      )}
      to={({ onBack }) => (
        <VaultBackupWithPassword
          vaultIds={vaultIds}
          onFinish={onFinish}
          onBack={onBack}
        />
      )}
    />
  )
}
