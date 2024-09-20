import { getValueProviderSetup } from '../../../lib/ui/state/getValueProviderSetup';

export const {
  useValue: useCurrentServerUrl,
  provider: CurrentServerUrlProvider,
} = getValueProviderSetup<string>('CurrentServerUrl');
