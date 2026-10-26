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

    // Opens that arrive while the launch arguments are still loading are
    // replayed after them, so the newest link is the one left on screen.
    let pending: string[][] | null = []
    const unsubscribe = EventsOn(launchArgsEvent, (args: string[]) => {
      if (pending) {
        pending.push(args)
      } else {
        openLaunchArgs(args)
      }
    })
    void GetOSArgs().then(launchArgs => {
      openLaunchArgs(launchArgs)
      pending?.forEach(openLaunchArgs)
      pending = null
    })

    return unsubscribe
  }, [navigate])

  return null
}
