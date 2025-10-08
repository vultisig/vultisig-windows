import { Vault } from '@core/ui/vault/Vault'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { OnFinishProp } from '@lib/ui/props'

import { VaultBackupWithoutPassword } from './VaultBackupWithoutPassword'
import { VaultBackupWithPassword } from './VaultBackupWithPassword'

type VaultBackupFlowProps = OnFinishProp & { vaults: Vault[] }

export const VaultBackupFlow = ({ onFinish, vaults }: VaultBackupFlowProps) => {
  return (
    <StepTransition
      from={({ onFinish: onPasswordRequest }) => (
        <VaultBackupWithoutPassword
          vaults={vaults}
          onFinish={onFinish}
          onPasswordRequest={onPasswordRequest}
        />
      )}
      to={({ onBack }) => (
        <VaultBackupWithPassword
          vaults={vaults}
          onFinish={onFinish}
          onBack={onBack}
        />
      )}
    />
  )
}
