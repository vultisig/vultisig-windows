import { VaultKeygenBackupFlow } from '@core/ui/mpc/keygen/backup/VaultKeygenBackupFlow'
import { useKeygenOperation } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { OnBackProp } from '@lib/ui/props'

import { MigrateSuccess } from '../migrate/MigrateSuccess'

type KeygenFlowEndingProps = OnBackProp & {
  password?: string
  onChangeEmailAndRestart?: () => void
}

export const KeygenFlowEnding = ({
  onBack,
  password,
  onChangeEmailAndRestart,
}: KeygenFlowEndingProps) => {
  const keygenOperation = useKeygenOperation()
  const navigate = useCoreNavigate()

  const isMigrateReshare =
    'reshare' in keygenOperation && keygenOperation.reshare === 'migrate'

  if (isMigrateReshare) {
    return (
      <StepTransition
        from={({ onFinish }) => (
          <VaultKeygenBackupFlow
            onFinish={onFinish}
            onBack={onBack}
            password={password}
            onChangeEmailAndRestart={onChangeEmailAndRestart}
          />
        )}
        to={() => <MigrateSuccess />}
      />
    )
  }

  return (
    <VaultKeygenBackupFlow
      onFinish={() => navigate({ id: 'vault' })}
      onBack={onBack}
      password={password}
      onChangeEmailAndRestart={onChangeEmailAndRestart}
    />
  )
}
