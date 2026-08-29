import {
  isLimitPriceChartInitiallyExpanded,
  LimitPriceChartExpansionStorage,
} from '@core/ui/storage/limitPriceChartExpanded'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const limitPriceChartExpansionStorage: LimitPriceChartExpansionStorage =
  {
    getIsLimitPriceChartExpanded: async () => {
      const value = persistentStorage.getItem<boolean>(
        StorageKey.isLimitPriceChartExpanded
      )

      if (value === undefined) {
        return isLimitPriceChartInitiallyExpanded
      }

      return value
    },
    setIsLimitPriceChartExpanded: async isExpanded => {
      persistentStorage.setItem(
        StorageKey.isLimitPriceChartExpanded,
        isExpanded
      )
    },
  }
