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

const getHeightValue = (value: number | null | undefined): number => value ?? -1

const isExplicitReset = (data: MoneroScanData): boolean =>
  data.scanHeight == null &&
  data.scanTarget == null &&
  data.birthdayScanDone === false &&
  data.balance === '0' &&
  (data.outputs?.length ?? 0) === 0

const mergeMoneroScanData = (
  existing: MoneroScanData,
  incoming: MoneroScanData
): MoneroScanData => {
  const preferIncoming =
    getHeightValue(incoming.scanHeight) >= getHeightValue(existing.scanHeight)
  const merged = preferIncoming
    ? { ...existing, ...incoming }
    : { ...incoming, ...existing }

  return {
    ...merged,
    scanHeight:
      existing.scanHeight == null && incoming.scanHeight == null
        ? null
        : Math.max(
            getHeightValue(existing.scanHeight),
            getHeightValue(incoming.scanHeight)
          ),
    scanTarget:
      existing.scanTarget == null && incoming.scanTarget == null
        ? null
        : Math.max(
            getHeightValue(existing.scanTarget),
            getHeightValue(incoming.scanTarget)
          ),
    birthHeight: incoming.birthHeight ?? existing.birthHeight,
    birthdayScanDone: existing.birthdayScanDone || incoming.birthdayScanDone,
  }
}

export const extensionMoneroScanStorage: MoneroScanStorage = {
  load: async (publicKeyEcdsa: string): Promise<MoneroScanData | null> => {
    const all = await getAll()
    return all[publicKeyEcdsa] ?? null
  },
  save: async (data: MoneroScanData): Promise<void> => {
    const all = await getAll()
    const existing = all[data.publicKeyEcdsa]
    all[data.publicKeyEcdsa] =
      existing && !isExplicitReset(data)
        ? mergeMoneroScanData(existing, data)
        : data
    await setStorageValue(StorageKey.moneroScanData, all)
  },
}
