import { Button } from '@clients/extension/src/components/button'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { CameraIcon } from '@lib/ui/icons/CameraIcon'

export const UploadQrPrompt = () => {
  const navigate = useCoreNavigate()

  return (
    <Button
      style={{ fontSize: 20 }}
      icon={<CameraIcon />}
      onClick={() => navigate({ id: 'uploadQr', state: {} })}
      size="sm"
      fitContent
    />
  )
}
