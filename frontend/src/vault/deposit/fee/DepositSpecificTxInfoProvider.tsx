import { useTranslation } from 'react-i18next';

import { Spinner } from '../../../lib/ui/loaders/Spinner';
import { ComponentWithChildrenProps } from '../../../lib/ui/props';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { getValueProviderSetup } from '../../../lib/ui/state/getValueProviderSetup';
import { StrictText } from '../../../lib/ui/text';
import { SpecificTransactionInfo } from '../../../model/specific-transaction-info';
import { useSpecificDepositTxInfoQuery } from '../queries/useSpecificDepositTxInfoQuery';

export const {
  useValue: useSendSpecificTxInfo,
  provider: SpecificSendTxInfoProvider,
} = getValueProviderSetup<SpecificTransactionInfo>('SendSpecificTxInfo');

export const SendSpecificTxInfoProvider: React.FC<
  ComponentWithChildrenProps
> = ({ children }) => {
  const txSpecificInfoQuery = useSpecificDepositTxInfoQuery();
  const { t } = useTranslation();

  return (
    <QueryDependant
      query={txSpecificInfoQuery}
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
