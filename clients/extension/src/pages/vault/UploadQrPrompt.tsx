import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CameraIcon } from '@lib/ui/icons/CameraIcon'

export const UploadQrPrompt = () => {
  const navigate = useCoreNavigate()

  return (
    <IconButton
      style={{ fontSize: 20 }}
      icon={<CameraIcon />}
      onClick={() => navigate({ id: 'uploadQr', state: {} })}
      size="m"
    />
  )
}
