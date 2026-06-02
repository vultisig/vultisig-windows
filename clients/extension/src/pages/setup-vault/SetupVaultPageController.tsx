import { shouldShowStationLegacyMigration } from '@clients/extension/src/pages/station-migration/stationLegacyMigrationGate'
import { StationMigrationPage } from '@clients/extension/src/pages/station-migration/StationMigrationPage'
import { shouldSuppressStationLegacyMigrationForSetup } from '@clients/extension/src/storage/stationLegacyMigrationStatus'
import { useStationLegacyMigrationStatusRecords } from '@clients/extension/src/storage/useStationLegacyMigrationStatusRecords'
import { useStationLegacyWalletStorageClassification } from '@clients/extension/src/storage/useStationLegacyWalletStorageClassification'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { currentProductBrand } from '@core/ui/product/brand'
import { SetupVaultPage } from '@core/ui/vault/create/setup-vault'
import { useState } from 'react'

export const SetupVaultPageController = () => {
  const [state] = useCoreViewState<'setupVault'>()
  const [hasSkippedMigration, setHasSkippedMigration] = useState(false)
  const isStationBrand = currentProductBrand === 'station'
  const classification = useStationLegacyWalletStorageClassification({
    enabled: isStationBrand,
  })
  const migrationStatusRecords = useStationLegacyMigrationStatusRecords({
    enabled: isStationBrand,
  })
  const skipMigration =
    hasSkippedMigration ||
    state?.skipStationMigration ||
    Boolean(state?.keyImportInput) ||
    shouldSuppressStationLegacyMigrationForSetup({
      classification,
      statusRecords: migrationStatusRecords,
    })

  if (
    shouldShowStationLegacyMigration({
      classification,
      productBrand: currentProductBrand,
      skip: skipMigration,
    })
  ) {
    return (
      <StationMigrationPage
        source="setup"
        onSkip={() => setHasSkippedMigration(true)}
      />
    )
  }

  return <SetupVaultPage />
}
