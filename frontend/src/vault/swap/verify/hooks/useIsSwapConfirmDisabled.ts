import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSwapTerms } from '../state/swapTerms';

export const useIsSwapConfirmDisabled = () => {
  const [terms] = useSwapTerms();
  const { t } = useTranslation();

  return useMemo(() => {
    if (terms.some(term => !term)) {
      return t('swap_agree_terms');
    }
    return false;
  }, [terms, t]);
};
