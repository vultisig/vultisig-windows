import { KeysignActionFees } from '../../../lib/types/keysign';
import { getStateProviderSetup } from '../../../lib/ui/state/getStateProviderSetup';

export const { useState: useSwapFees, provider: SwapFeesProvider } =
  getStateProviderSetup<
    | null
    // @antonio creating this as an object in case in the future we need the fees as a number and not formatted string
    | KeysignActionFees
  >('SwapFees');
