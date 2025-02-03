import { useTranslation } from 'react-i18next';

import { OnBackProp, OnForwardProp } from '../../../lib/ui/props';
import { WaitForServerToJoinStep } from '../../server/components/WaitForServerToJoinStep';
import { useVaultType } from '../shared/state/vaultType';

export const SetupVaultWaitServerStep: React.FC<
  OnForwardProp & OnBackProp
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
