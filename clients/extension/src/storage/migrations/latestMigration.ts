import { getPersistentState } from '../../state/persistent/getPersistentState'
import { setPersistentState } from '../../state/persistent/setPersistentState'
import { StorageMigrationKey } from '.'

const latestMigrationKey = 'latestMigration'

export const getLatestMigration =
  async (): Promise<StorageMigrationKey | null> => {
    return getPersistentState<StorageMigrationKey | null>(
      latestMigrationKey,
      null
    )
  }

export const setLatestMigration = async (
  version: StorageMigrationKey
): Promise<void> => {
  await setPersistentState<StorageMigrationKey>(latestMigrationKey, version)
}
