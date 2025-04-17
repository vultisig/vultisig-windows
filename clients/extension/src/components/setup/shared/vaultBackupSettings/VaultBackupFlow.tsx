import { StepTransition } from '@lib/ui/base/StepTransition'
import { OnFinishProp } from '@lib/ui/props'

import { VaultBackupWithoutPassword } from './VaultBackupWithoutPassword'
import { VaultBackupWithPassword } from './VaultBackupWithPassword'

export const VaultBackupFlow = ({ onFinish }: OnFinishProp) => {
  return (
    <StepTransition
      from={({ onFinish }) => (
        <VaultBackupWithoutPassword
          onFinish={onFinish}
          onPasswordRequest={onFinish}
        />
      )}
      to={({ onBack }) => (
        <VaultBackupWithPassword onFinish={onFinish} onBack={onBack} />
      )}
    />
  )
}
