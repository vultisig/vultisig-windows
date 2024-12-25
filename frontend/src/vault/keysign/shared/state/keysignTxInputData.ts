import { getValueProviderSetup } from '../../../../lib/ui/state/getValueProviderSetup';

export const {
  useValue: useKeysignTxInputData,
  provider: KeysignTxInputDataProvider,
} = getValueProviderSetup<Uint8Array[]>('KeysignTxInputData');
