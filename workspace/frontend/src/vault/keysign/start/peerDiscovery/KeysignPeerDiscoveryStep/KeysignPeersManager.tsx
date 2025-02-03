import { PeersManager } from '../../../../keygen/shared/peerDiscovery/PeersManager';
import { useKeysignPeerOptionsQuery } from '../../../shared/queries/useKeysignPeerOptionsQuery';

export const KeysignPeersManager = () => {
  const peerOptionsQuery = useKeysignPeerOptionsQuery();

  return <PeersManager peerOptionsQuery={peerOptionsQuery} />;
};
