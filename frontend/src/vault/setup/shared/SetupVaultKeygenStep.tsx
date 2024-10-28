import { useTranslation } from 'react-i18next';

import { ComponentWithBackActionProps } from '../../../lib/ui/props';
import { KeygenStep } from '../../keygen/shared/KeygenStep';
import { useVaultType } from './state/vaultType';

type SetupVaultKeygenStepProps = ComponentWithBackActionProps & {
  onTryAgain: () => void;
};

export const SetupVaultKeygenStep = (props: SetupVaultKeygenStepProps) => {
  const { t } = useTranslation();

  const vaultType = useVaultType();

  return (
    <KeygenStep
      title={t('keygen_for_vault', {
        type: t(vaultType),
      })}
      {...props}
    />
  );
};
