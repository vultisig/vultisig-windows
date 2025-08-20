import { prefixErrorWith } from '@lib/utils/error/prefixErrorWith'
import { transformError } from '@lib/utils/error/transformError'

import { storageMigrationKeys, storageMigrations } from '.'
import { getLatestMigration } from './latestMigration'

export const runStorageMigrations = async () => {
  const latestMigration = await getLatestMigration()

  const migrationKeys = latestMigration
    ? storageMigrationKeys.slice(
        storageMigrationKeys.indexOf(latestMigration) + 1
      )
    : storageMigrationKeys

  for (const migrationKey of migrationKeys) {
    const migration = storageMigrations[migrationKey]

    await transformError(
      migration(),
      prefixErrorWith(`Failed to run ${migrationKey} storage migration `)
    )
  }
}
