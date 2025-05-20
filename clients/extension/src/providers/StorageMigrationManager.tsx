import { getPersistentState } from '@clients/extension/src/state/persistent/getPersistentState'
import { setPersistentState } from '@clients/extension/src/state/persistent/setPersistentState'
import { ProductLogoBlock } from '@core/ui/product/ProductLogoBlock'
import { useCore } from '@core/ui/state/core'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
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
  const { t } = useTranslation()
  const { version } = useCore()

  const { mutate: migrate, ...mutationStatus } = useMutation({
    mutationFn: async () => {
      const storedVersion = await getExtensionVersion()

      if (!storedVersion) {
        console.warn('Version missing. Clearing storage for migration.')
        await chrome.storage.local.clear()
      }

      await setExtensionVersion(version)
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
          message={extractErrorMsg(error)}
        />
      )}
      success={() => <>{children}</>}
    />
  )
}
