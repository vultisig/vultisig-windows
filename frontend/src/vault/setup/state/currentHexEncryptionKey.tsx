import { getValueProviderSetup } from '../../../lib/ui/state/getValueProviderSetup';

export const {
  useValue: useCurrentHexEncryptionKey,
  provider: CurrentHexEncryptionKeyProvider,
} = getValueProviderSetup<string>('CurrentHexEncryptionKey');
