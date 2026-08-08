import {
  SolanaMoveStakeDestinations,
  SolanaMoveStakeDestinationsStorage,
} from '@core/ui/storage/solanaMoveStakeDestinations'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const solanaMoveStakeDestinationsStorage: SolanaMoveStakeDestinationsStorage =
  {
    getSolanaMoveStakeDestinations: async () =>
      persistentStorage.getItem<SolanaMoveStakeDestinations>(
        StorageKey.solanaMoveStakeDestinations
      ) ?? {},
    setSolanaMoveStakeDestinations: async destinations => {
      persistentStorage.setItem(
        StorageKey.solanaMoveStakeDestinations,
        destinations
      )
    },
  }
