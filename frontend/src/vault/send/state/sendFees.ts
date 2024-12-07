import { KeysignActionFees } from '../../../lib/types/keysign';
import { getStateProviderSetup } from '../../../lib/ui/state/getStateProviderSetup';

export const { useState: useSendFees, provider: SendFeesProvider } =
  getStateProviderSetup<null | KeysignActionFees>('SendFees');
