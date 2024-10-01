import { getStateProviderSetup } from '../../../lib/ui/state/getStateProviderSetup';
import { KeygenThresholdType } from '../../keygen/KeygenThresholdType';

export const {
  useState: useCurrentKeygenThreshold,
  provider: CurrentKeygenThresholdProvider,
} = getStateProviderSetup<KeygenThresholdType>('CurrentKeygenThreshold');
