import { DeviceCountPicker } from '@core/ui/vault/create/setup-vault/DeviceCountPicker'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { OnFinishProp } from '@lib/ui/props'
import { getKeygenThreshold } from '@vultisig/core-mpc/getKeygenThreshold'
import { useTranslation } from 'react-i18next'

// Slider tops out at "4+" (index 3), so a vault whose minimum exceeds that is
// clamped — the "4+" peer-discovery gate then accepts the extra devices.
const maxSelectableIndex = 3

/**
 * "How many devices do you have?" step for the secure reshare flow. Reuses the
 * new-vault device-count picker, but clamps it to the committee the vault can
 * still be secured with: the minimum device count matches iOS
 * (`getThreshold() + 1` === `getKeygenThreshold(currentSigners)`), so a user
 * can't reshare down to a number that would break the threshold.
 */
export const ReshareDeviceCountStep = ({ onFinish }: OnFinishProp<number>) => {
  const { t } = useTranslation()
  const goBack = useNavigateBack()
  const { signers } = useCurrentVault()

  const currentDeviceCount = signers.length
  const minDeviceCount = getKeygenThreshold(currentDeviceCount)
  const minSelectableIndex = Math.min(minDeviceCount - 1, maxSelectableIndex)
  const initialIndex = Math.min(currentDeviceCount - 1, maxSelectableIndex)

  return (
    <DeviceCountPicker
      onBack={goBack}
      initialIndex={initialIndex}
      minSelectableIndex={minSelectableIndex}
      submitText={t('next')}
      belowMinSubmitText={t('reshare_min_devices_required', {
        count: minDeviceCount,
      })}
      onSubmit={selectedDeviceCount => onFinish(selectedDeviceCount + 1)}
    />
  )
}
