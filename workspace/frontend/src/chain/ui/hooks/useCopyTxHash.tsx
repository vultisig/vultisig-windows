import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useToast } from '../../../lib/ui/toast/ToastProvider';

export const useCopyTxHash = () => {
  const { addToast } = useToast();

  const { t } = useTranslation();

  return useCallback(
    (address: string) => {
      navigator.clipboard.writeText(address);
      addToast({ message: t('transaction_hash_copied') });
    },
    [addToast, t]
  );
};
