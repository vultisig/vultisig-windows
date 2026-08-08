import {
  setStationLegacyMigrationStatusRecord,
  StationLegacyMigrationPersistentFailureCode,
} from '@clients/extension/src/storage/stationLegacyMigrationStatus'
import { CreateSecureVaultFlow } from '@core/ui/mpc/keygen/create/secure/CreateSecureVaultFlow'
import { VaultSecurityTypeProvider } from '@core/ui/mpc/keygen/create/state/vaultSecurityType'
import { KeyImportConfigProviders } from '@core/ui/mpc/keygen/keyimport/KeyImportConfigProviders'
import { isStationTerraRootKeyImportInput } from '@core/ui/mpc/keygen/keyimport/state/keyImportInput'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { getVaultId, Vault } from '@vultisig/core-mpc/vault/Vault'

export const SetupSecureVaultPage = () => {
  const [state] = useCoreViewState<'setupSecureVault'>()
  const keyImportInput = state?.keyImportInput
  const stationMigration =
    keyImportInput && isStationTerraRootKeyImportInput(keyImportInput)
      ? keyImportInput.stationMigration
      : undefined

  const markStationMigration = async ({
    failureCode,
    status,
    vault,
  }: {
    failureCode?: StationLegacyMigrationPersistentFailureCode
    status: 'migrated' | 'failed'
    vault?: Vault
  }) => {
    if (!stationMigration) return

    await setStationLegacyMigrationStatusRecord({
      ...stationMigration,
      status,
      updatedAt: Date.now(),
      ...(failureCode ? { failureCode } : {}),
      ...(vault ? { vaultId: getVaultId(vault) } : {}),
    })
  }

  const content = (
    <CreateSecureVaultFlow
      deviceCount={state?.deviceCount}
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
    <VaultSecurityTypeProvider value="secure">
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
