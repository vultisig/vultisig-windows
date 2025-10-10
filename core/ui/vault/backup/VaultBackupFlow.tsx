import { StepTransition } from '@lib/ui/base/StepTransition'
import { OnFinishProp } from '@lib/ui/props'

import { VaultBackupWithoutPassword } from './VaultBackupWithoutPassword'
import { VaultBackupWithPassword } from './VaultBackupWithPassword'

type VaultBackupFlowProps = OnFinishProp & { vaultIds: string[] }

export const VaultBackupFlow = ({
  onFinish,
  vaultIds,
}: VaultBackupFlowProps) => {
  return (
    <StepTransition
      from={({ onFinish: onPasswordRequest }) => (
        <VaultBackupWithoutPassword
          vaultIds={vaultIds}
          onFinish={onFinish}
          onPasswordRequest={onPasswordRequest}
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
