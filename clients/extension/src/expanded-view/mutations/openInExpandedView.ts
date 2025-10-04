import { useCore } from '@core/ui/state/core'
import { useMutation } from '@tanstack/react-query'

import { AppView } from '../../navigation/AppView'
import { setInitialView } from '../../storage/initialView'

export const useOpenInExpandedViewMutation = () => {
  const { openUrl } = useCore()

  return useMutation({
    mutationFn: async (view: AppView) => {
      await setInitialView(view)
      openUrl(`chrome-extension://${chrome.runtime.id}/index.html`)
    },
  })
}
