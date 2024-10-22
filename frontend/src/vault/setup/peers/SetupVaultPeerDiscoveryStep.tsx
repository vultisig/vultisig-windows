import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ComponentWithBackActionProps,
  ComponentWithForwardActionProps,
} from '../../../lib/ui/props';
import { KeygenPeerDiscoveryStep } from '../../keygen/shared/peerDiscovery/KeygenPeerDiscoveryStep';
import { useSelectedPeers } from '../../keysign/shared/state/selectedPeers';
import { SetupVaultType } from '../type/SetupVaultType';
import { useJoinKeygenUrlQuery } from './queries/useJoinKeygenUrlQuery';

type SetupVaultPeerDiscoveryStepProps = ComponentWithForwardActionProps &
  ComponentWithBackActionProps & {
    setupVaultType: SetupVaultType;
  };

export const SetupVaultPeerDiscoveryStep = ({
  onForward,
  onBack,
  setupVaultType,
}: SetupVaultPeerDiscoveryStepProps) => {
  const { t } = useTranslation();
  const peers = useSelectedPeers();

  const isDisabled = useMemo(() => {
    if (peers.length < 1) {
      return t('select_at_least_one_device');
    }
  }, [peers.length, t]);

  const joinUrlQuery = useJoinKeygenUrlQuery();

  return (
    <KeygenPeerDiscoveryStep
      title={t('keygen_for', { type: t(setupVaultType) })}
      onBack={onBack}
      onForward={onForward}
      isDisabled={isDisabled}
      joinUrlQuery={joinUrlQuery}
    />
  );
};
