import { PeersManager } from './PeersManager';
import { usePeerOptionsQuery } from './queries/usePeerOptionsQuery';

export const KeygenPeersManager = () => {
  const peerOptionsQuery = usePeerOptionsQuery();

  return <PeersManager peerOptionsQuery={peerOptionsQuery} />;
};
