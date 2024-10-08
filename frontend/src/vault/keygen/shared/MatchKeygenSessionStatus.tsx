import { ReactNode, useEffect, useState } from 'react';

import { EventsOn } from '../../../../wailsjs/runtime/runtime';

type MatchKeygenSessionStatusProps = {
  pending: () => ReactNode;
  active: () => ReactNode;
};

export const MatchKeygenSessionStatus = ({
  pending,
  active,
}: MatchKeygenSessionStatusProps) => {
  const [hasKeygenStarted, setHasKeygenStarted] = useState<boolean>(false);

  useEffect(() => {
    EventsOn('PrepareVault', () => setHasKeygenStarted(true));
  }, []);

  return <>{hasKeygenStarted ? active() : pending()}</>;
};
