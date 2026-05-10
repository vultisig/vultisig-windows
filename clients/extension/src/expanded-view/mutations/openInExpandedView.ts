import { useCore } from '@core/ui/state/core'
import { useMutation } from '@tanstack/react-query'

import { AppView } from '../../navigation/AppView'
import { setInitialView } from '../../storage/initialView'

/**
 * Mutation hook that persists the target view and opens the extension in an expanded tab.
 */
export const useOpenInExpandedViewMutation = () => {
  const { openUrl } = useCore()

  return useMutation({
    mutationFn: async (view: AppView) => {
      await setInitialView(view)
      openUrl(chrome.runtime.getURL('index.html'))
    },
  })
}
