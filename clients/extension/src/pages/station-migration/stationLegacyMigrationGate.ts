import { ProductBrand } from '@core/ui/product/brand'

import { StationLegacyStorageClassification } from '../../storage/stationLegacyWalletClassifier'

type ShouldShowStationLegacyMigrationInput = {
  classification: StationLegacyStorageClassification
  productBrand: ProductBrand
  skip?: boolean
}

export const shouldShowStationLegacyMigration = ({
  classification,
  productBrand,
  skip = false,
}: ShouldShowStationLegacyMigrationInput) =>
  productBrand === 'station' && !skip && classification.wallets.length > 0
