import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getVaultActionSignersMin } from '../../../../keygen/utils/getVaultActionSignersMin';
import { useVaultKeygenDevices } from '../../../../setup/hooks/useVaultKegenDevices';
import { useAssertCurrentVault } from '../../../../state/useCurrentVault';

export const useIsPeerDiscoveryStepDisabled = () => {
  const { t } = useTranslation();
  const devices = useVaultKeygenDevices();
  const { signers } = useAssertCurrentVault();

  return useMemo(() => {
    const requiredPeersNumber = getVaultActionSignersMin(signers.length);

    if (devices.length !== requiredPeersNumber) {
      return t('select_n_devices', { count: requiredPeersNumber - 1 });
    }
  }, [devices.length, signers.length, t]);
};
