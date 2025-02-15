import { OnBackProp, OnForwardProp } from '../../../lib/ui/props';
import { WaitForServerToJoinStep } from '../../server/components/WaitForServerToJoinStep';

export const SetupVaultWaitServerStep: React.FC<
  OnForwardProp & OnBackProp
> = props => {
  return <WaitForServerToJoinStep {...props} />;
};
