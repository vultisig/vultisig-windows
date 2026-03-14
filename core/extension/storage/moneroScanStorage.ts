import {
  MoneroScanData,
  MoneroScanStorage,
} from '@core/chain/chains/monero/moneroScanStorage'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

type MoneroScanDataMap = Record<string, MoneroScanData>

const getAll = async (): Promise<MoneroScanDataMap> =>
  getStorageValue<MoneroScanDataMap>(StorageKey.moneroScanData, {})

export const extensionMoneroScanStorage: MoneroScanStorage = {
  load: async (publicKeyEcdsa: string): Promise<MoneroScanData | null> => {
    const all = await getAll()
    return all[publicKeyEcdsa] ?? null
  },
  save: async (data: MoneroScanData): Promise<void> => {
    const all = await getAll()
    all[data.publicKeyEcdsa] = data
    await setStorageValue(StorageKey.moneroScanData, all)
  },
}
