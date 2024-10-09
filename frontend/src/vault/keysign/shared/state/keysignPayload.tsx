import { KeysignPayload } from '../../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { getValueProviderSetup } from '../../../../lib/ui/state/getValueProviderSetup';

export const { useValue: useKeysignPayload, provider: KeysignPayloadProvider } =
  getValueProviderSetup<KeysignPayload>('KeysignPayload');
