import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSelectedPeers } from '../../../keysign/shared/state/selectedPeers';
import { useCurrentKeygenThreshold } from '../../state/currentKeygenThreshold';

export const useIsPeerDiscoveryStepDisabled = () => {
  const { t } = useTranslation();
  const peers = useSelectedPeers();
  const [thresholdType] = useCurrentKeygenThreshold();

  return useMemo(() => {
    const requiredDevices = Number(thresholdType.split('/')[1]);
    if (isNaN(requiredDevices)) {
      if (peers.length < 1) {
        return t('select_at_least_one_device');
      }

      return false;
    }

    const requiredPeers = requiredDevices - 1;

    if (peers.length !== requiredPeers) {
      return t('select_n_devices', { count: requiredPeers });
    }
  }, [peers.length, t, thresholdType]);
};
