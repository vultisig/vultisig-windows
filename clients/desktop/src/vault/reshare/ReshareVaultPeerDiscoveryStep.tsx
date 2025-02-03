import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { OnForwardProp } from '../../lib/ui/props';
import { KeygenPeerDiscoveryStep } from '../keygen/shared/peerDiscovery/KeygenPeerDiscoveryStep/KeygenPeerDiscoveryStep';
import { useSelectedPeers } from '../keysign/shared/state/selectedPeers';
import { useJoinReshareUrlQuery } from './queries/useJoinReshareUrlQuery';

export const ReshareVaultPeerDiscoveryStep = ({ onForward }: OnForwardProp) => {
  const { t } = useTranslation();
  const peers = useSelectedPeers();

  const isDisabled = useMemo(() => {
    if (peers.length < 1) {
      return t('select_at_least_one_device');
    }
  }, [peers.length, t]);

  const joinUrlQuery = useJoinReshareUrlQuery();

  return (
    <KeygenPeerDiscoveryStep
      joinUrlQuery={joinUrlQuery}
      title={t('reshare')}
      onForward={onForward}
      isDisabled={isDisabled}
    />
  );
};
