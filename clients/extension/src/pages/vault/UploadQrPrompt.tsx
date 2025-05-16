import { Button } from '@clients/extension/src/components/button'
import { CoreView } from '@core/ui/navigation/CoreView'
import { useCore } from '@core/ui/state/core'
import { CameraIcon } from '@lib/ui/icons/CameraIcon'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { useMutation } from '@tanstack/react-query'

import { setInitialView } from '../../navigation/state'

export const UploadQrPrompt = () => {
  const { openUrl } = useCore()

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const view: CoreView = { id: 'uploadQr', state: {} }

      await setInitialView(view)
      openUrl(`chrome-extension://${chrome.runtime.id}/index.html`)
    },
  })

  return (
    <Button
      style={{ fontSize: 20 }}
      icon={isPending ? <Spinner /> : <CameraIcon />}
      onClick={() => mutate()}
      size="sm"
      fitContent
    />
  )
}
