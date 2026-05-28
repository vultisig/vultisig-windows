import { currentProductBrand } from '@core/ui/product/brand'
import { ListItem } from '@lib/ui/list/item'
import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'
import { useTranslation } from 'react-i18next'

import { AppView } from '../../navigation/AppView'
import { shouldShowStationLegacyMigration } from '../../pages/station-migration/stationLegacyMigrationGate'
import { StationMigrationListItemIcon } from '../../pages/station-migration/StationMigrationListItemIcon'
import { useStationLegacyWalletStorageClassification } from '../../storage/useStationLegacyWalletStorageClassification'

export const StationMigrationSettingsEntry = () => {
  const { t } = useTranslation()
  const navigate = useNavigate<AppView>()
  const isStationBrand = currentProductBrand === 'station'
  const classification = useStationLegacyWalletStorageClassification({
    enabled: isStationBrand,
  })

  if (
    !shouldShowStationLegacyMigration({
      classification,
      productBrand: currentProductBrand,
    })
  ) {
    return null
  }

  return (
    <ListItem
      data-testid="station-migration-settings-link"
      icon={<StationMigrationListItemIcon />}
      onClick={() =>
        navigate({ id: 'stationMigration', state: { source: 'settings' } })
      }
      title={t('station_migration_settings_title')}
      description={t('station_migration_settings_description')}
      showArrow
    />
  )
}
