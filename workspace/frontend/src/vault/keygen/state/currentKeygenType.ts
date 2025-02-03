import { getValueProviderSetup } from '../../../lib/ui/state/getValueProviderSetup';
import { KeygenType } from '../KeygenType';

export const {
  useValue: useCurrentKeygenType,
  provider: CurrentKeygenTypeProvider,
} = getValueProviderSetup<KeygenType>('CurrentKeygenType');
