import { VaultKeygenBackupFlow } from '@core/ui/mpc/keygen/backup/VaultKeygenBackupFlow'
import { useKeygenOperation } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Match } from '@lib/ui/base/Match'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { OnBackProp } from '@lib/ui/props'
import { Vault } from '@vultisig/core-mpc/vault/Vault'

import { MigrateSuccess } from '../migrate/MigrateSuccess'
import { KeygenFlowSuccess } from './KeygenFlowSuccess'

const reshareSuccessDurationMs = 3000

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
  const navigate = useCoreNavigate()

  const backupFlow = (onFinish: () => void) => (
    <VaultKeygenBackupFlow
      onFinish={onFinish}
      onBack={onBack}
      password={password}
      onChangeEmailAndRestart={onChangeEmailAndRestart}
      onVaultSaveError={onVaultSaveError}
      onVaultSaved={onVaultSaved}
    />
  )

  // Reshare shows the "Vault reshared successfully" screen first (briefly),
  // then walks through the backup guide — the reverse of the create flow,
  // where the success screen is terminal.
  if ('reshare' in keygenOperation && keygenOperation.reshare === 'regular') {
    return (
      <StepTransition
        from={({ onFinish }) => (
          <KeygenFlowSuccess
            onFinish={onFinish}
            durationMs={reshareSuccessDurationMs}
          />
        )}
        to={() => backupFlow(() => navigate({ id: 'vault' }))}
      />
    )
  }

  return (
    <StepTransition
      from={({ onFinish }) => backupFlow(onFinish)}
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
