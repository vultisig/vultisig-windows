import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { StrictText } from '../../../lib/ui/text';
import { extractErrorMsg } from '../../../lib/utils/error/extractErrorMsg';
import { StartKeysignPrompt } from '../../keysign/components/StartKeysignPrompt';
import { useSwapKeysignPayloadQuery } from '../queries/useSwapKeysignPayloadQuery';
import { useSwapFees } from '../state/swapFees';
import { useSwapTerms } from './state/swapTerms';

export const SwapConfirm = () => {
  const { t } = useTranslation();
  const [fees] = useSwapFees();
  const keysignPayloadQuery = useSwapKeysignPayloadQuery();

  const [terms] = useSwapTerms();
  const isDisabled = useMemo(() => {
    if (terms.some(term => !term)) {
      return t('terms_required');
    }
  }, [t, terms]);

  return (
    <QueryDependant
      query={keysignPayloadQuery}
      pending={() => <StrictText>{t('loading')}</StrictText>}
      error={error => <StrictText>{extractErrorMsg(error)}</StrictText>}
      success={keysignPayload => (
        <StartKeysignPrompt
          value={keysignPayload}
          fees={fees}
          isDisabled={isDisabled}
        />
      )}
    />
  );
};
