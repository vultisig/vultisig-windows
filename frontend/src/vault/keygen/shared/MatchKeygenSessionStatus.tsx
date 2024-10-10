import { ReactNode, useEffect, useState } from 'react';

import { EventsOn } from '../../../../wailsjs/runtime/runtime';

export type KeygenStatus = 'prepareVault' | 'ecdsa' | 'eddsa';

type MatchKeygenSessionStatusProps = {
  pending: () => ReactNode;
  active: (status: KeygenStatus) => ReactNode;
};

export const MatchKeygenSessionStatus = ({
  pending,
  active,
}: MatchKeygenSessionStatusProps) => {
  const [status, setStatus] = useState<KeygenStatus | null>(null);

  useEffect(() => {
    EventsOn('PrepareVault', () => setStatus('prepareVault'));
    EventsOn('ECDSA', () => setStatus('ecdsa'));
    EventsOn('EdDSA', () => setStatus('eddsa'));
  }, []);

  return <>{status === null ? pending() : active(status)}</>;
};
