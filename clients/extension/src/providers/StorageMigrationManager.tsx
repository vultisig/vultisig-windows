import { getPersistentState } from '@clients/extension/src/state/persistent/getPersistentState'
import { setPersistentState } from '@clients/extension/src/state/persistent/setPersistentState'
import { ProductLogoBlock } from '@core/ui/product/ProductLogoBlock'
import { useCore } from '@core/ui/state/core'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

const latestInstalledVersionQueryKey = ['latestInstalledVersion']
const [key] = latestInstalledVersionQueryKey

const getExtensionVersion = async (): Promise<string | null> => {
  return getPersistentState<string | null>(key, null)
}

const setExtensionVersion = async (version: string): Promise<void> => {
  await setPersistentState<string>(key, version)
}

export const StorageMigrationsManager = ({ children }: ChildrenProp) => {
  const { version } = useCore()
  const { t } = useTranslation()

  const migration = useQuery({
    queryKey: ['storageMigration'],
    queryFn: async () => {
      const storedVersion = await getExtensionVersion()

      if (!storedVersion) {
        console.warn('Version missing. Clearing storage for migration.')
        await chrome.storage.local.clear()
        await setExtensionVersion(version)
        return true
      }

      if (storedVersion !== version) {
        // Future migration logic can go here
        await setExtensionVersion(version)
      }

      return true
    },
    staleTime: Infinity, // Don't re-run
    retry: 2, // Retry if migration fails
  })

  return (
    <MatchQuery
      value={migration}
      pending={() => <ProductLogoBlock />}
      error={error => (
        <FlowErrorPageContent
          title={t('failed_to_migrate_storage')}
          message={extractErrorMsg(error)}
        />
      )}
      success={() => <>{children}</>}
    />
  )
}
