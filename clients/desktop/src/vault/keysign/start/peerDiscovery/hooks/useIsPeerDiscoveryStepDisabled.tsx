import { getKeygenThreshold } from '@core/keygen/utils/getKeygenThreshold'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useVaultKeygenDevices } from '../../../../setup/hooks/useVaultKegenDevices'
import { useCurrentVault } from '../../../../state/currentVault'

export const useIsPeerDiscoveryStepDisabled = () => {
  const { t } = useTranslation()
  const devices = useVaultKeygenDevices()
  const { signers } = useCurrentVault()

  return useMemo(() => {
    const requiredPeersNumber = getKeygenThreshold(signers.length)

    if (devices.length !== requiredPeersNumber) {
      return t('select_n_devices', { count: requiredPeersNumber - 1 })
    }
  }, [devices.length, signers.length, t])
}
