import { KeysignMessagePayload } from '../../../../chain/keysign/KeysignMessagePayload';
import { getValueProviderSetup } from '../../../../lib/ui/state/getValueProviderSetup';

export const {
  useValue: useKeysignMessagePayload,
  provider: KeysignMessagePayloadProvider,
} = getValueProviderSetup<KeysignMessagePayload>('KeysignMessagePayload');
