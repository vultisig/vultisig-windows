import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { ProductLogoBlock } from '@core/ui/product/ProductLogoBlock'
import { useCore } from '@core/ui/state/core'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { storageMigrationKeys } from '.'
import { setLatestMigration } from './latestMigration'
import { runStorageMigrations } from './run'

const getExtensionVersion = async (): Promise<string | null> => {
  return getStorageValue<string | null>(StorageKey.latestInstalledVersion, null)
}

const setExtensionVersion = async (version: string): Promise<void> => {
  await setStorageValue<string>(StorageKey.latestInstalledVersion, version)
}

export const StorageMigrationsManager = ({ children }: ChildrenProp) => {
  const { t } = useTranslation()
  const { version } = useCore()

  const { mutate: migrate, ...mutationStatus } = useMutation({
    mutationFn: async () => {
      const storedVersion = await getExtensionVersion()

      if (!storedVersion) {
        console.warn('Version missing. Clearing storage for migration.')
        await chrome.storage.local.clear()
        await setLatestMigration(getLastItem(storageMigrationKeys))
      }

      await setExtensionVersion(version)

      await runStorageMigrations()

      return true
    },
  })

  useEffect(() => {
    migrate()
  }, [migrate])

  return (
    <MatchQuery
      value={mutationStatus}
      pending={() => <ProductLogoBlock />}
      error={error => (
        <FlowErrorPageContent
          title={t('failed_to_migrate_storage')}
          error={error}
        />
      )}
      success={() => <>{children}</>}
    />
  )
}
