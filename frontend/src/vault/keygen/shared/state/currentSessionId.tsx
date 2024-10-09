import { getValueProviderSetup } from '../../../../lib/ui/state/getValueProviderSetup';

export const {
  useValue: useCurrentSessionId,
  provider: CurrentSessionIdProvider,
} = getValueProviderSetup<string>('CurrentSessionId');
