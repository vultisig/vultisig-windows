import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ComponentWithBackActionProps,
  ComponentWithForwardActionProps,
} from '../../../lib/ui/props';
import { KeygenPeerDiscoveryStep } from '../../keygen/shared/peerDiscovery/KeygenPeerDiscoveryStep';
import { useSelectedPeers } from '../../keysign/shared/state/selectedPeers';
import { useCurrentKeygenThreshold } from '../state/currentKeygenThreshold';
import { useJoinKeygenUrlQuery } from './queries/useJoinKeygenUrlQuery';

export const SetupVaultPeerDiscoveryStep = ({
  onForward,
  onBack,
}: ComponentWithForwardActionProps & ComponentWithBackActionProps) => {
  const { t } = useTranslation();
  const peers = useSelectedPeers();
  const [thresholdType] = useCurrentKeygenThreshold();

  const isDisabled = useMemo(() => {
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

  const joinUrlQuery = useJoinKeygenUrlQuery();

  return (
    <KeygenPeerDiscoveryStep
      title={`${t('keygen_for')} ${thresholdType} ${t('vault')}`}
      onBack={onBack}
      onForward={onForward}
      isDisabled={isDisabled}
      joinUrlQuery={joinUrlQuery}
    />
  );
};
