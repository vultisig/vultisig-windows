import { useCore } from '@core/ui/state/core'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Opens an external link while keeping the user where they are. Where the
 * client can open it in the background (the extension action popup) it does,
 * and raises a toast since nothing else visibly changes; elsewhere it is plain
 * `openUrl`.
 */
export const useOpenExternalUrl = () => {
  const { openUrl, openUrlInBackground } = useCore()
  const { addToast } = useToast()
  const { t } = useTranslation()

  return useCallback(
    async (url: string) => {
      if (!openUrlInBackground) {
        openUrl(url)
        return
      }

      await openUrlInBackground(url)
      addToast({ message: t('opened_in_new_tab') })
    },
    [addToast, openUrl, openUrlInBackground, t]
  )
}
