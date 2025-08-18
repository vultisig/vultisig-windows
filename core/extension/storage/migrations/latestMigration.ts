import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

import { StorageMigrationKey } from '.'

const latestMigrationKey = 'latestMigration'

export const getLatestMigration =
  async (): Promise<StorageMigrationKey | null> => {
    return getStorageValue<StorageMigrationKey | null>(latestMigrationKey, null)
  }

export const setLatestMigration = async (
  version: StorageMigrationKey
): Promise<void> => {
  await setStorageValue<StorageMigrationKey>(latestMigrationKey, version)
}
