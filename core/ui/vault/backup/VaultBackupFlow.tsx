import { StepTransition } from '@lib/ui/base/StepTransition'
import { OnFinishProp } from '@lib/ui/props'

import { VaultBackupWithoutPassword } from './VaultBackupWithoutPassword'
import { VaultBackupWithPassword } from './VaultBackupWithPassword'

export const VaultBackupFlow = ({ onFinish }: OnFinishProp) => {
  return (
    <StepTransition
      from={({ onFinish: onPasswordRequest }) => (
        <VaultBackupWithoutPassword
          onFinish={onFinish}
          onPasswordRequest={onPasswordRequest}
        />
      )}
      to={({ onBack }) => (
        <VaultBackupWithPassword onFinish={onFinish} onBack={onBack} />
      )}
    />
  )
}
