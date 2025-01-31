import { useMemo } from 'react';

import { ChildrenProp } from '../../../lib/ui/props';
import { getValueProviderSetup } from '../../../lib/ui/state/getValueProviderSetup';
import { generateLocalPartyId } from '../utils/localPartyId';

export const {
  useValue: useCurrentLocalPartyId,
  provider: CurrentLocalPartyIdProvider,
} = getValueProviderSetup<string>('CurrentLocalPartyId');

export const GeneratedLocalPartyIdProvider = ({ children }: ChildrenProp) => {
  const LocalPartyId = useMemo(generateLocalPartyId, []);

  return (
    <CurrentLocalPartyIdProvider value={LocalPartyId}>
      {children}
    </CurrentLocalPartyIdProvider>
  );
};
