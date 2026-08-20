import { StorageKey } from '@core/ui/storage/StorageKey'
import { setStorageValue } from '@lib/extension/storage/set'

import { runStorageMigrations } from './run'

const setExtensionVersion = async (version: string): Promise<void> => {
  await setStorageValue<string>(StorageKey.latestInstalledVersion, version)
}

/**
 * Versionless storage can contain vaults retained across an extension reinstall.
 * Treat it as the oldest supported schema and migrate it in place.
 */
export const migrateExtensionStorage = async (
  version: string
): Promise<void> => {
  await runStorageMigrations()
  await setExtensionVersion(version)
}
