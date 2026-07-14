import { DeviceCountPicker } from '@core/ui/vault/create/setup-vault/DeviceCountPicker'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { VStack } from '@lib/ui/layout/Stack'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getKeygenThreshold } from '@vultisig/core-mpc/getKeygenThreshold'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ReshareThresholdNotMetCard } from './ReshareThresholdNotMetCard'

// Slider tops out at "4+" (index 3), so a vault whose minimum exceeds that is
// clamped — the "4+" peer-discovery gate then accepts the extra devices.
const maxSelectableIndex = 3

const ThresholdOverlay = styled(VStack)`
  gap: 16px;
  padding: 12px 16px 0;
  width: 100%;
`

/**
 * "How many devices do you have?" step for the secure reshare flow. Reuses the
 * new-vault device-count picker, but clamps it to the committee the vault can
 * still be secured with: the minimum device count matches iOS
 * (`getThreshold() + 1` === `getKeygenThreshold(currentSigners)`), so a user
 * can't reshare down to a number that would break the threshold. Below the
 * minimum, a "Threshold not met" card is drawn over the picker.
 */
export const ReshareDeviceCountStep = ({ onFinish }: OnFinishProp<number>) => {
  const { t } = useTranslation()
  const goBack = useNavigateBack()
  const { signers } = useCurrentVault()

  const currentDeviceCount = signers.length
  const minDeviceCount = getKeygenThreshold(currentDeviceCount)
  const requiredSigners = minDeviceCount - 1
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
      renderBelowMin={selectedIndex => (
        <ThresholdOverlay alignItems="center">
          <Text color="contrast" size={12} weight={500} centerHorizontally>
            {t('reshare_more_devices_required')}
          </Text>
          <ReshareThresholdNotMetCard
            fromDeviceCount={currentDeviceCount}
            toDeviceCount={selectedIndex + 1}
            requiredSigners={requiredSigners}
          />
        </ThresholdOverlay>
      )}
      onSubmit={selectedDeviceCount =>
        // The slider caps at "4+" (index 3), so for vaults whose minimum
        // exceeds 4 the raw selection would understate the target and let peer
        // discovery proceed below the threshold — clamp the target up to the
        // required minimum.
        onFinish(Math.max(selectedDeviceCount + 1, minDeviceCount))
      }
    />
  )
}
