import { getValueProviderSetup } from '../../../lib/ui/state/getValueProviderSetup';

export const {
  useValue: useCurrentHexChainCode,
  provider: CurrentHexChainCodeProvider,
} = getValueProviderSetup<string>('CurrentHexChainCode');
