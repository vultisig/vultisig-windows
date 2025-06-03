import { KeygenOperation } from '@core/mpc/keygen/KeygenOperation'
import { VaultKeygenBackupFlow } from '@core/ui/mpc/keygen/backup/VaultKeygenBackupFlow'
import { useCurrentKeygenOperationType } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { OnBackProp } from '@lib/ui/props'
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion'
import { JSX } from 'react'

import { MigrateSuccess } from '../migrate/MigrateSuccess'
import { KeygenFlowSuccess } from './KeygenFlowSuccess'

export const KeygenFlowEnding = ({ onBack }: OnBackProp) => {
  const operationType = useCurrentKeygenOperationType()

  return (
    <StepTransition
      from={({ onFinish }) => (
        <VaultKeygenBackupFlow onFinish={onFinish} onBack={onBack} />
      )}
      to={() =>
        matchDiscriminatedUnion<KeygenOperation, JSX.Element>(
          operationType,
          'operation',
          'type',
          {
            migrate: () => <MigrateSuccess />,
            reshare: () => <KeygenFlowSuccess />,
            create: () => <KeygenFlowSuccess />,
            plugin: () => <KeygenFlowSuccess />,
            regular: () => <KeygenFlowSuccess />,
          }
        )
      }
    />
  )
}
