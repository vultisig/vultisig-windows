import {
  ZcashScanData,
  ZcashScanStorage,
} from '@core/chain/chains/zcash/zcashScanStorage'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

type ZcashScanDataMap = Record<string, ZcashScanData>

const getAll = async (): Promise<ZcashScanDataMap> =>
  getStorageValue<ZcashScanDataMap>(StorageKey.zcashScanData, {})

export const extensionZcashScanStorage: ZcashScanStorage = {
  load: async (publicKeyEcdsa: string): Promise<ZcashScanData | null> => {
    const all = await getAll()
    return all[publicKeyEcdsa] ?? null
  },
  save: async (data: ZcashScanData): Promise<void> => {
    const all = await getAll()
    all[data.publicKeyEcdsa] = data
    await setStorageValue(StorageKey.zcashScanData, all)
  },
}
