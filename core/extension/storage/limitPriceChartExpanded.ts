import {
  isLimitPriceChartInitiallyExpanded,
  LimitPriceChartExpansionStorage,
} from '@core/ui/storage/limitPriceChartExpanded'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

export const limitPriceChartExpansionStorage: LimitPriceChartExpansionStorage =
  {
    getIsLimitPriceChartExpanded: async () =>
      getStorageValue(
        StorageKey.isLimitPriceChartExpanded,
        isLimitPriceChartInitiallyExpanded
      ),
    setIsLimitPriceChartExpanded: async isExpanded => {
      await setStorageValue(StorageKey.isLimitPriceChartExpanded, isExpanded)
    },
  }
