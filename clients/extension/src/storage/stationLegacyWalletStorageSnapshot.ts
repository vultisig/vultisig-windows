import {
  classifyStationLegacyWalletStorage,
  StationLegacyStorageClassification,
  stationLegacyStorageKeys,
  StationLegacyStorageSnapshot,
} from './stationLegacyWalletClassifier'

export type StationLegacyStorageReader = Pick<Storage, 'getItem'>

export const stationLegacyLocalStorageKeys = [
  stationLegacyStorageKeys.wallets,
  stationLegacyStorageKeys.keys,
  stationLegacyStorageKeys.passwordChallenge,
  stationLegacyStorageKeys.connectedWallet,
  stationLegacyStorageKeys.isMigrationDone,
]

const getBrowserLocalStorage = (): StationLegacyStorageReader | undefined => {
  if (typeof window === 'undefined') return undefined

  return window.localStorage
}

export const getStationLegacyWalletStorageSnapshot = (
  storage: StationLegacyStorageReader
): StationLegacyStorageSnapshot => {
  const snapshot: StationLegacyStorageSnapshot = {}

  stationLegacyLocalStorageKeys.forEach(key => {
    snapshot[key] = storage.getItem(key)
  })

  return snapshot
}

export const getEmptyStationLegacyWalletStorageClassification =
  (): StationLegacyStorageClassification =>
    classifyStationLegacyWalletStorage({})

export const getStationLegacyWalletStorageClassification = (
  storage = getBrowserLocalStorage()
): StationLegacyStorageClassification => {
  if (!storage) {
    return getEmptyStationLegacyWalletStorageClassification()
  }

  return classifyStationLegacyWalletStorage(
    getStationLegacyWalletStorageSnapshot(storage)
  )
}
