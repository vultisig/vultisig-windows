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

const stationLegacyMigrationPersistentStatuses: readonly StationLegacyMigrationPersistentStatus[] =
  ['failed', 'importing', 'migrated', 'skipped']

const stationLegacyMigrationPersistentFailureCodes: readonly StationLegacyMigrationPersistentFailureCode[] =
  ['vaultImportFailed', 'vaultSaveFailed']

const stationLegacyMigrationSources = ['mnemonic', 'privateKey', 'seed']

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isOneOf = <T extends string>(
  options: readonly T[],
  value: unknown
): value is T =>
  typeof value === 'string' && options.some(option => option === value)

const isMigrationStatusRecord = (
  value: unknown
): value is StationLegacyMigrationStatusRecord => {
  if (!isRecord(value)) return false

  if (
    !isOneOf(stationLegacyMigrationPersistentStatuses, value.status) ||
    typeof value.walletId !== 'string' ||
    typeof value.walletName !== 'string' ||
    typeof value.updatedAt !== 'number'
  ) {
    return false
  }

  if (
    value.source !== undefined &&
    !isOneOf(stationLegacyMigrationSources, value.source)
  ) {
    return false
  }

  if (value.vaultId !== undefined && typeof value.vaultId !== 'string') {
    return false
  }

  if (
    value.failureCode !== undefined &&
    !isOneOf(stationLegacyMigrationPersistentFailureCodes, value.failureCode)
  ) {
    return false
  }

  return true
}

export const getStationLegacyMigrationStatusRecords =
  async (): Promise<StationLegacyMigrationStatusRecords> => {
    const storageArea = getStorageArea()
    if (!storageArea) return {}

    const result = await storageArea.get(stationLegacyMigrationStatusStorageKey)
    const value = result[stationLegacyMigrationStatusStorageKey]

    if (!isRecord(value)) return {}

    return Object.fromEntries(
      Object.entries(value).filter(
        (entry): entry is [string, StationLegacyMigrationStatusRecord] =>
          isMigrationStatusRecord(entry[1])
      )
    )
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
