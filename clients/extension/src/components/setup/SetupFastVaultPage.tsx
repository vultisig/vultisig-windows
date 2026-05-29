import {
  setStationLegacyMigrationStatusRecord,
  StationLegacyMigrationPersistentFailureCode,
} from '@clients/extension/src/storage/stationLegacyMigrationStatus'
import { CreateFastVaultFlow } from '@core/ui/mpc/keygen/create/fast/CreateFastVaultFlow'
import { VaultSecurityTypeProvider } from '@core/ui/mpc/keygen/create/state/vaultSecurityType'
import { KeyImportConfigProviders } from '@core/ui/mpc/keygen/keyimport/KeyImportConfigProviders'
import { isStationTerraRootKeyImportInput } from '@core/ui/mpc/keygen/keyimport/state/keyImportInput'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { getVaultId, Vault } from '@vultisig/core-mpc/vault/Vault'

export const SetupFastVaultPage = () => {
  const [state] = useCoreViewState<'setupFastVault'>()
  const keyImportInput = state?.keyImportInput
  const stationMigration =
    keyImportInput && isStationTerraRootKeyImportInput(keyImportInput)
      ? keyImportInput.stationMigration
      : undefined

  const markStationMigration = ({
    failureCode,
    status,
    vault,
  }: {
    failureCode?: StationLegacyMigrationPersistentFailureCode
    status: 'migrated' | 'failed'
    vault?: Vault
  }) => {
    if (!stationMigration) return

    void setStationLegacyMigrationStatusRecord({
      ...stationMigration,
      status,
      updatedAt: Date.now(),
      ...(failureCode ? { failureCode } : {}),
      ...(vault ? { vaultId: getVaultId(vault) } : {}),
    })
  }

  const content = (
    <CreateFastVaultFlow
      onVaultSaved={vault =>
        markStationMigration({ status: 'migrated', vault })
      }
      onKeygenError={() =>
        markStationMigration({
          status: 'failed',
          failureCode: 'vaultImportFailed',
        })
      }
      onVaultSaveError={() =>
        markStationMigration({
          status: 'failed',
          failureCode: 'vaultSaveFailed',
        })
      }
    />
  )

  return (
    <VaultSecurityTypeProvider value="fast">
      <KeygenOperationProvider value={{ create: true }}>
        {keyImportInput ? (
          <KeyImportConfigProviders keyImportInput={keyImportInput}>
            {content}
          </KeyImportConfigProviders>
        ) : (
          content
        )}
      </KeygenOperationProvider>
    </VaultSecurityTypeProvider>
  )
}
