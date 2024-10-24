import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { ComponentWithChildrenProps } from '../../../../lib/ui/props';
import { getValueProviderSetup } from '../../../../lib/ui/state/getValueProviderSetup';

export const {
  useValue: useCurrentSessionId,
  provider: CurrentSessionIdProvider,
} = getValueProviderSetup<string>('CurrentSessionId');

export const GeneratedSessionIdProvider = ({
  children,
}: ComponentWithChildrenProps) => {
  const sessionId = useMemo(uuidv4, []);

  return (
    <CurrentSessionIdProvider value={sessionId}>
      {children}
    </CurrentSessionIdProvider>
  );
};
