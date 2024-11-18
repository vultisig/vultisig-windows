import { useTranslation } from 'react-i18next';

import { ComponentWithBackActionProps } from '../../../lib/ui/props';
import { KeygenStepWithEmailVerification } from '../../keygen/shared/KeygenStepWithEmailVerification';
import { KeygenStepWithoutEmailVerification } from '../../keygen/shared/KeygenStepWithoutEmailVerification';
import { useVaultType } from './state/vaultType';

type SetupVaultKeygenStepProps = ComponentWithBackActionProps & {
  onTryAgain: () => void;
};

export const SetupVaultKeygenStep = (props: SetupVaultKeygenStepProps) => {
  const { t } = useTranslation();
  const vaultType = useVaultType();

  if (vaultType === 'secure') {
    return (
      <KeygenStepWithoutEmailVerification
        title={t('keygen_for_vault', {
          type: t(vaultType),
        })}
        {...props}
      />
    );
  }

  return (
    <KeygenStepWithEmailVerification
      title={t('keygen_for_vault', {
        type: t(vaultType),
      })}
      {...props}
    />
  );
};
