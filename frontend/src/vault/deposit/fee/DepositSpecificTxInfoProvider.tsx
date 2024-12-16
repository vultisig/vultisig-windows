import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Spinner } from '../../../lib/ui/loaders/Spinner';
import { ComponentWithChildrenProps } from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { getValueProviderSetup } from '../../../lib/ui/state/getValueProviderSetup';
import { StrictText } from '../../../lib/ui/text';
import { SpecificTransactionInfo } from '../../../model/specific-transaction-info';
import { useSpecificDepositTxInfoQuery } from '../queries/useSpecificDepositTxInfoQuery';

export const {
  useValue: useSendSpecificTxInfo,
  provider: SpecificSendTxInfoProvider,
} = getValueProviderSetup<SpecificTransactionInfo>('SendSpecificTxInfo');

export const DepositSpecificTxInfoProvider: FC<ComponentWithChildrenProps> = ({
  children,
}) => {
  const txSpecificInfoQuery = useSpecificDepositTxInfoQuery();
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
