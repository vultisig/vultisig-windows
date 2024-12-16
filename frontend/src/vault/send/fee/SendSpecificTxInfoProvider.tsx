import { useTranslation } from 'react-i18next';

import { Spinner } from '../../../lib/ui/loaders/Spinner';
import { ComponentWithChildrenProps } from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { getValueProviderSetup } from '../../../lib/ui/state/getValueProviderSetup';
import { StrictText } from '../../../lib/ui/text';
import { SpecificTransactionInfo } from '../../../model/specific-transaction-info';
import { useSpecificSendTxInfoQuery } from '../queries/useSpecificSendTxInfoQuery';

export const {
  useValue: useSendSpecificTxInfo,
  provider: SpecificSendTxInfoProvider,
} = getValueProviderSetup<SpecificTransactionInfo>('SendSpecificTxInfo');

export const SendSpecificTxInfoProvider: React.FC<
  ComponentWithChildrenProps
> = ({ children }) => {
  const txSpecificInfoQuery = useSpecificSendTxInfoQuery();
  const { t } = useTranslation();

  return (
    <MatchQuery
      value={txSpecificInfoQuery}
      pending={() => <Spinner />}
      error={() => <StrictText>{t('failed_to_load')}</StrictText>}
      success={value => (
        <SpecificSendTxInfoProvider value={value}>
          {children}
        </SpecificSendTxInfoProvider>
      )}
    />
  );
};
