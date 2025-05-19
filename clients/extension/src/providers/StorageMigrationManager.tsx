import { getPersistentState } from '@clients/extension/src/state/persistent/getPersistentState'
import { setPersistentState } from '@clients/extension/src/state/persistent/setPersistentState'
import { getManifestVersion } from '@clients/extension/src/state/utils/getManifestVersion'
import { ProductLogoBlock } from '@core/ui/product/ProductLogoBlock'
import { ChildrenProp } from '@lib/ui/props'
import { useEffect, useState } from 'react'

const latestInstalledVersionQueryKey = ['latestInstalledVersion']
const [key] = latestInstalledVersionQueryKey

const getExtensionVersion = async (): Promise<string | null> => {
  return getPersistentState<string | null>(key, null)
}

const setExtensionVersion = async (version: string): Promise<void> => {
  await setPersistentState<string>(key, version)
}

export const StorageMigrationsManager = ({ children }: ChildrenProp) => {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const migrate = async () => {
      try {
        const storedVersion = await getExtensionVersion()

        if (!storedVersion) {
          console.warn('Version missing. Clearing storage for migration.')
          await chrome.storage.local.clear()
        }

        await setExtensionVersion(getManifestVersion())
      } catch (error) {
        console.error('Migration failed:', error)
      } finally {
        setIsReady(true)
      }
    }

    migrate()
  }, [])

  if (!isReady) return <ProductLogoBlock />

  return <>{children}</>
}
