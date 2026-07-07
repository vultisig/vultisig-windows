import { DeviceCountPicker } from '@core/ui/vault/create/setup-vault/DeviceCountPicker'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { OnFinishProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

/**
 * "How many devices do you have?" step for the secure reshare flow. Reuses the
 * new-vault device-count picker but keeps it in the secure range (>= 2 devices)
 * and reports the resolved device count (slider index + 1) to the flow.
 */
export const ReshareDeviceCountStep = ({ onFinish }: OnFinishProp<number>) => {
  const { t } = useTranslation()
  const goBack = useNavigateBack()

  return (
    <DeviceCountPicker
      onBack={goBack}
      initialIndex={1}
      minSelectableIndex={1}
      submitText={t('next')}
      onSubmit={selectedDeviceCount => onFinish(selectedDeviceCount + 1)}
    />
  )
}
