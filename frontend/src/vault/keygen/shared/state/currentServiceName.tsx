import { getValueProviderSetup } from '../../../../lib/ui/state/getValueProviderSetup';

export const {
  useValue: useCurrentServiceName,
  provider: CurrentServiceNameProvider,
} = getValueProviderSetup<string>('CurrentServiceName');
