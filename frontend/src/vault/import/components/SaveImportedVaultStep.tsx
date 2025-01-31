import { useTranslation } from 'react-i18next';

import { storage } from '../../../../wailsjs/go/models';
import { ValueProp } from '../../../lib/ui/props';
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate';
import { SaveVaultStep } from '../../keygen/shared/SaveVaultStep';

export const SaveImportedVaultStep = ({ value }: ValueProp<storage.Vault>) => {
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
