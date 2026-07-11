import {
  SolanaMoveStakeDestinations,
  SolanaMoveStakeDestinationsStorage,
} from '@core/ui/storage/solanaMoveStakeDestinations'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

const emptyDestinations: SolanaMoveStakeDestinations = {}

export const solanaMoveStakeDestinationsStorage: SolanaMoveStakeDestinationsStorage =
  {
    getSolanaMoveStakeDestinations: async () =>
      getStorageValue(
        StorageKey.solanaMoveStakeDestinations,
        emptyDestinations
      ),
    setSolanaMoveStakeDestinations: async destinations => {
      await setStorageValue(
        StorageKey.solanaMoveStakeDestinations,
        destinations
      )
    },
  }
