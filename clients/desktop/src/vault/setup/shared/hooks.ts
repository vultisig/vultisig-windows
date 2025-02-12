import { useTranslation } from 'react-i18next';

import { useVaultNames } from '../../hooks/useVaultNames';
import { MAX_VAULT_NAME_LENGTH } from './constants';

export const useValidateVaultName = (value?: string) => {
  const names = useVaultNames();
  const { t } = useTranslation();

  if (!value) {
    return t('vault_name_required');
  }

  if (value.length > MAX_VAULT_NAME_LENGTH) {
    return t('vault_name_max_length_error');
  }

  if (names.includes(value)) {
    return t('vault_name_already_exists');
  }
};
