import { getValueProviderSetup } from '../../../lib/ui/state/getValueProviderSetup';

export const {
  useValue: useCurrentLocalPartyId,
  provider: CurrentLocalPartyIdProvider,
} = getValueProviderSetup<string>('CurrentLocalPartyId');
