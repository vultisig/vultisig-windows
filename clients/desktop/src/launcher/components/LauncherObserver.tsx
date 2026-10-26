import { deepLinkBaseUrl, deepLinkBaseUrlAt } from '@vultisig/core-config'
import { EventsOn } from '@wailsapp/runtime'
import { useEffect } from 'react'

import { GetOSArgs } from '../../../wailsjs/go/main/App'
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'

const launchArgsEvent = 'launchArgs'

/**
 * Routes a deeplink or `.vult` file the OS hands the app, both at launch and
 * while it is already running.
 */
export const LauncherObserver = () => {
  const navigate = useAppNavigate()

  useEffect(() => {
    const openLaunchArgs = (args: string[]) => {
      const url = args.find(arg =>
        [deepLinkBaseUrl, deepLinkBaseUrlAt].some(base => arg.startsWith(base))
      )
      const filePath = args.find(arg => arg.endsWith('.vult'))

      if (url) {
        navigate({ id: 'deeplink', state: { url } })
      } else if (filePath) {
        navigate({ id: 'importVaultFromFile', state: { filePath } })
      }
    }

    const unsubscribe = EventsOn(launchArgsEvent, openLaunchArgs)
    void GetOSArgs().then(openLaunchArgs)

    return unsubscribe
  }, [navigate])

  return null
}
