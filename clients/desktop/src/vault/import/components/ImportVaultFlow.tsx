import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'

import { storage } from '../../../../wailsjs/go/models'
import { VaultBackupOverrideProvider } from '../state/vaultBackupOverride'
import { FileBasedVaultBackupResult } from '../VaultBakupResult'
import { DecryptVaultStep } from './DecryptVaultStep'
import { ProcessVaultContainer } from './ProcessVaultContainer'
import { SaveImportedVaultStep } from './SaveImportedVaultStep'

type ImportVaultFlowProps = {
  renderBackupAcquisitionStep: ({
    onFinish,
  }: {
    onFinish: (result: FileBasedVaultBackupResult) => void
  }) => React.ReactNode
}

export const ImportVaultFlow = ({
  renderBackupAcquisitionStep,
}: ImportVaultFlowProps) => {
  return (
    <ValueTransfer<FileBasedVaultBackupResult>
      from={renderBackupAcquisitionStep}
      to={({ value }) => (
        <VaultBackupOverrideProvider value={value.override ?? null}>
          <MatchRecordUnion
            value={value.result}
            handlers={{
              vaultContainer: vaultContainer => (
                <ProcessVaultContainer value={vaultContainer} />
              ),
              vault: vault => <SaveImportedVaultStep value={vault} />,
              encryptedVault: encryptedVault => (
                <ValueTransfer<storage.Vault>
                  from={({ onFinish }) => (
                    <DecryptVaultStep
                      value={encryptedVault}
                      onFinish={onFinish}
                    />
                  )}
                  to={({ value }) => <SaveImportedVaultStep value={value} />}
                />
              ),
            }}
          />
        </VaultBackupOverrideProvider>
      )}
    />
  )
}
