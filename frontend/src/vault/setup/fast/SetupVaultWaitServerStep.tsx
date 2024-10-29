import { useTranslation } from 'react-i18next';

import {
  ComponentWithBackActionProps,
  ComponentWithForwardActionProps,
} from '../../../lib/ui/props';
import { WaitForServerToJoinStep } from '../../server/components/WaitForServerToJoinStep';
import { useVaultType } from '../shared/state/vaultType';

export const SetupVaultWaitServerStep: React.FC<
  ComponentWithForwardActionProps & ComponentWithBackActionProps
> = props => {
  const type = useVaultType();
  const { t } = useTranslation();

  return (
    <WaitForServerToJoinStep
      {...props}
      title={t('keygen_for_vault', { type: t(type) })}
    />
  );
};
