import { getValueProviderSetup } from '../../../../lib/ui/state/getValueProviderSetup';

export const {
  useValue: useCurrentKeysignMsgs,
  provider: CurrentKeysignMsgsProvider,
} = getValueProviderSetup<string[]>('CurrentKeysignMsgs');
