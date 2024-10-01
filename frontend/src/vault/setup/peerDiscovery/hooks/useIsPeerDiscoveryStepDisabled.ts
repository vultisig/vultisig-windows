import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useCurrentKeygenThreshold } from '../../state/currentKeygenThreshold';
import { useCurrentPeers } from '../../state/currentPeers';

export const useIsPeerDiscoveryStepDisabled = () => {
  const { t } = useTranslation();
  const [peers] = useCurrentPeers();
  const [thresholdType] = useCurrentKeygenThreshold();

  return useMemo(() => {
    const requiredNumber = Number(thresholdType.split('/')[0]);
    if (isNaN(requiredNumber)) {
      if (peers.length < 1) {
        return t('select_at_least_one_device');
      }

      return false;
    }

    const requiredPeersNumber = requiredNumber - 1;

    if (peers.length !== requiredPeersNumber) {
      return t('select_n_devices', { count: requiredPeersNumber });
    }
  }, [peers.length, t, thresholdType]);
};
