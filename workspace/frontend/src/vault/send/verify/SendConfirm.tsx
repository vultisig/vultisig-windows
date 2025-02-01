import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { Text } from '../../../lib/ui/text';
import { extractErrorMsg } from '../../../lib/utils/error/extractErrorMsg';
import { StartKeysignPrompt } from '../../keysign/components/StartKeysignPrompt';
import { useSendTxKeysignPayloadQuery } from '../state/useSendTxKeysignPayloadQuery';
import { useSendTerms } from './state/sendTerms';

export const SendConfirm = () => {
  const { t } = useTranslation();
  const keysignPayloadQuery = useSendTxKeysignPayloadQuery();
  const [terms] = useSendTerms();

  const isDisabled = useMemo(() => {
    if (terms.some(term => !term)) {
      return t('terms_required');
    }
  }, [t, terms]);

  return (
    <MatchQuery
      value={keysignPayloadQuery}
      error={err => <Text>{extractErrorMsg(err)}</Text>}
      pending={() => <Text>{t('loading')}</Text>}
      success={value => (
        <StartKeysignPrompt value={value} isDisabled={isDisabled} />
      )}
    />
  );
};
