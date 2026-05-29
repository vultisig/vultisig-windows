import { StationLegacyStorageClassification } from './stationLegacyWalletClassifier'

export const stationLegacyMigrationStatusStorageKey =
  'stationLegacyMigrationStatus'

export type StationLegacyMigrationPersistentStatus =
  | 'importing'
  | 'migrated'
  | 'failed'
  | 'skipped'

export type StationLegacyMigrationPersistentFailureCode =
  | 'vaultImportFailed'
  | 'vaultSaveFailed'

export type StationLegacyMigrationStatusRecord = {
  status: StationLegacyMigrationPersistentStatus
  walletId: string
  walletName: string
  updatedAt: number
  source?: 'mnemonic' | 'seed' | 'privateKey'
  vaultId?: string
  failureCode?: StationLegacyMigrationPersistentFailureCode
}

export type StationLegacyMigrationStatusRecords = Record<
  string,
  StationLegacyMigrationStatusRecord
>

const getStorageArea = () => {
  if (typeof chrome === 'undefined') return undefined

  return chrome.storage?.local
}

export const getStationLegacyMigrationStatusRecords =
  async (): Promise<StationLegacyMigrationStatusRecords> => {
    const storageArea = getStorageArea()
    if (!storageArea) return {}

    const result = await storageArea.get(stationLegacyMigrationStatusStorageKey)
    const value = result[stationLegacyMigrationStatusStorageKey]

    return value && typeof value === 'object'
      ? (value as StationLegacyMigrationStatusRecords)
      : {}
  }

export const setStationLegacyMigrationStatusRecord = async (
  record: StationLegacyMigrationStatusRecord
) => {
  const storageArea = getStorageArea()
  if (!storageArea) return record

  const records = await getStationLegacyMigrationStatusRecords()
  const nextRecords: StationLegacyMigrationStatusRecords = {
    ...records,
    [record.walletId]: record,
  }

  await storageArea.set({
    [stationLegacyMigrationStatusStorageKey]: nextRecords,
  })

  return record
}

export const setStationLegacyMigrationStatusRecords = async (
  recordsToUpdate: StationLegacyMigrationStatusRecords
) => {
  const storageArea = getStorageArea()
  if (!storageArea) return recordsToUpdate

  const records = await getStationLegacyMigrationStatusRecords()
  const nextRecords = {
    ...records,
    ...recordsToUpdate,
  }

  await storageArea.set({
    [stationLegacyMigrationStatusStorageKey]: nextRecords,
  })

  return nextRecords
}

const terminalSetupStatuses: StationLegacyMigrationPersistentStatus[] = [
  'failed',
  'migrated',
  'skipped',
]

export const shouldSuppressStationLegacyMigrationForSetup = ({
  classification,
  statusRecords,
}: {
  classification: StationLegacyStorageClassification
  statusRecords: StationLegacyMigrationStatusRecords
}) => {
  const supportedWallets = classification.wallets.filter(
    wallet => wallet.status === 'supported'
  )

  return (
    supportedWallets.length > 0 &&
    supportedWallets.every(wallet => {
      const walletId = `${wallet.storageKey}:${wallet.storageIndex ?? 'storage'}`
      const status = statusRecords[walletId]?.status

      return status && terminalSetupStatuses.includes(status)
    })
  )
}
