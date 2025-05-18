import { VaultKeygenBackupFlow } from '@core/ui/mpc/keygen/backup/VaultKeygenBackupFlow'
import { useCurrentKeygenType } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { Match } from '@lib/ui/base/Match'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { OnBackProp } from '@lib/ui/props'

import { MigrateSuccess } from '../migrate/MigrateSuccess'
import { KeygenFlowSuccess } from './KeygenFlowSuccess'

export const KeygenFlowEnding = ({ onBack }: OnBackProp) => {
  const keygenType = useCurrentKeygenType()

  return (
    <StepTransition
      from={({ onFinish }) => (
        <VaultKeygenBackupFlow onFinish={onFinish} onBack={onBack} />
      )}
      to={() => (
        <Match
          value={keygenType}
          migrate={() => <MigrateSuccess />}
          reshare={() => <KeygenFlowSuccess />}
          create={() => <KeygenFlowSuccess />}
        />
      )}
    />
  )
}
