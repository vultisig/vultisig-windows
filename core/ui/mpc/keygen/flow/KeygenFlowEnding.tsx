import { VaultKeygenBackupFlow } from '@core/ui/mpc/keygen/backup/VaultKeygenBackupFlow'
import { useKeygenOperation } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { Match } from '@lib/ui/base/Match'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { OnBackProp } from '@lib/ui/props'
import { Vault } from '@vultisig/core-mpc/vault/Vault'

import { MigrateSuccess } from '../migrate/MigrateSuccess'
import { KeygenFlowSuccess } from './KeygenFlowSuccess'

type KeygenFlowEndingProps = OnBackProp & {
  password?: string
  onChangeEmailAndRestart?: () => void
  onVaultSaveError?: (error: Error) => void | Promise<void>
  onVaultSaved?: (vault: Vault) => void | Promise<void>
}

export const KeygenFlowEnding = ({
  onBack,
  password,
  onChangeEmailAndRestart,
  onVaultSaveError,
  onVaultSaved,
}: KeygenFlowEndingProps) => {
  const keygenOperation = useKeygenOperation()

  return (
    <StepTransition
      from={({ onFinish }) => (
        <VaultKeygenBackupFlow
          onFinish={onFinish}
          onBack={onBack}
          password={password}
          onChangeEmailAndRestart={onChangeEmailAndRestart}
          onVaultSaveError={onVaultSaveError}
          onVaultSaved={onVaultSaved}
        />
      )}
      to={() => (
        <MatchRecordUnion
          value={keygenOperation}
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
            keyimport: () => <KeygenFlowSuccess />,
            singleKeygen: () => <KeygenFlowSuccess />,
          }}
        />
      )}
    />
  )
}
