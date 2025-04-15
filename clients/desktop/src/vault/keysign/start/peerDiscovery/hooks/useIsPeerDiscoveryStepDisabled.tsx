import { getKeygenThreshold } from '@core/mpc/getKeygenThreshold'
import { useMpcDevices } from '@core/ui/mpc/state/mpcDevices'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const useIsPeerDiscoveryStepDisabled = () => {
  const { t } = useTranslation()
  const devices = useMpcDevices()
  const { signers } = useCurrentVault()

  return useMemo(() => {
    const requiredDevicesNumber = getKeygenThreshold(signers.length)

    if (devices.length !== requiredDevicesNumber) {
      return t('select_n_devices', { count: requiredDevicesNumber - 1 })
    }
  }, [devices.length, signers.length, t])
}
