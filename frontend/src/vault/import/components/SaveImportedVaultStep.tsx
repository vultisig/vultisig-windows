import { useTranslation } from 'react-i18next';

import { storage } from '../../../../wailsjs/go/models';
import { ComponentWithValueProps } from '../../../lib/ui/props';
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate';
import { SaveVaultStep } from '../../keygen/shared/SaveVaultStep';

export const SaveImportedVaultStep = ({
  value,
}: ComponentWithValueProps<storage.Vault>) => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();

  return (
    <SaveVaultStep
      onForward={() => navigate('vault')}
      value={value}
      title={t('import_vault')}
    />
  );
};
