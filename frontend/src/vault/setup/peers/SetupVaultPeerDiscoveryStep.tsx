import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ComponentWithBackActionProps,
  ComponentWithForwardActionProps,
} from '../../../lib/ui/props';
import { KeygenPeerDiscoveryStep } from '../../keygen/shared/peerDiscovery/KeygenPeerDiscoveryStep';
import { useSelectedPeers } from '../../keysign/shared/state/selectedPeers';
import { useVaultType } from '../shared/state/vaultType';
import { useJoinKeygenUrlQuery } from './queries/useJoinKeygenUrlQuery';

const requiredPeers = 1;

export const SetupVaultPeerDiscoveryStep: React.FC<
  ComponentWithForwardActionProps & ComponentWithBackActionProps
> = ({ onForward, onBack }) => {
  const { t } = useTranslation();
  const peers = useSelectedPeers();

  const type = useVaultType();

  const isDisabled = useMemo(() => {
    if (peers.length < requiredPeers) {
      return t('select_n_devices', { count: requiredPeers });
    }
  }, [peers.length, t]);

  const joinUrlQuery = useJoinKeygenUrlQuery();

  return (
    <KeygenPeerDiscoveryStep
      title={t('keygen_for_vault', { type: t(type) })}
      onBack={onBack}
      onForward={onForward}
      isDisabled={isDisabled}
      joinUrlQuery={joinUrlQuery}
    />
  );
};
