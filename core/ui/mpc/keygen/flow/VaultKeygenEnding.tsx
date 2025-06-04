import { VaultKeygenBackupFlow } from '@core/ui/mpc/keygen/backup/VaultKeygenBackupFlow'
import { useCurrentKeygenOperationType } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { Match } from '@lib/ui/base/Match'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { OnBackProp } from '@lib/ui/props'

import { MigrateSuccess } from '../migrate/MigrateSuccess'
import { KeygenFlowSuccess } from './KeygenFlowSuccess'

export const KeygenFlowEnding = ({ onBack }: OnBackProp) => {
  const operationType = useCurrentKeygenOperationType()

  return (
    <StepTransition
      from={({ onFinish }) => (
        <VaultKeygenBackupFlow onFinish={onFinish} onBack={onBack} />
      )}
      to={() => (
        <MatchRecordUnion
          value={operationType}
          handlers={{
            create: () => <KeygenFlowSuccess />,
            reshare: value => (
              <Match
                value={value}
                migrate={() => <MigrateSuccess />}
                plugin={() => <KeygenFlowSuccess />}
                regular={() => <KeygenFlowSuccess />}
              />
            ),
          }}
        />
      )}
    />
  )
}
