import { getPersistentState } from '@clients/extension/src/state/persistent/getPersistentState'
import { setPersistentState } from '@clients/extension/src/state/persistent/setPersistentState'
import { useEffect } from 'react'

const versionQueryKey = ['version']
const [key] = versionQueryKey

const getExtensionVersion = async (): Promise<string | null> => {
  return getPersistentState<string | null>(key, null)
}

const setExtensionVersion = async (version: string): Promise<void> => {
  await setPersistentState<string>(key, version)
}

export const useAssertVersion = (currentVersion: string) => {
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const storedVersion = await getExtensionVersion()
        if (!storedVersion) {
          console.warn('Version missing. Clearing storage for migration.')
          await chrome.storage.local.clear()
        }

        await setExtensionVersion(currentVersion)
      } catch (error) {
        console.error('Version check failed:', error)
      }
    }
    checkVersion()
  }, [currentVersion])
}
