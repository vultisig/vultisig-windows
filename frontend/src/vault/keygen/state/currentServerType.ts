import { getStateProviderSetup } from '../../../lib/ui/state/getStateProviderSetup';
import { KeygenServerType } from '../KeygenServerType';

export const {
  useState: useCurrentServerType,
  provider: CurrentServerTypeProvider,
} = getStateProviderSetup<KeygenServerType>('CurrentServerType');
