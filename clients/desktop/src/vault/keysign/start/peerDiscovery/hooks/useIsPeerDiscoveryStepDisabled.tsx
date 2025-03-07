import { getKeygenThreshold } from '@core/mpc/getKeygenThreshold'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useVaultKeygenDevices } from '../../../../setup/hooks/useVaultKegenDevices'
import { useCurrentVault } from '../../../../state/currentVault'

export const useIsPeerDiscoveryStepDisabled = () => {
  const { t } = useTranslation()
  const devices = useVaultKeygenDevices()
  const { signers } = useCurrentVault()

  return useMemo(() => {
    const requiredDevicesNumber = getKeygenThreshold(signers.length)

    if (devices.length !== requiredDevicesNumber) {
      return t('select_n_devices', { count: requiredDevicesNumber - 1 })
    }
  }, [devices.length, signers.length, t])
}
