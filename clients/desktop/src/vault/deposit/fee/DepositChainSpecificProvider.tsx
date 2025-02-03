import { useTranslation } from 'react-i18next';

import { KeysignChainSpecific } from '../../../chain/keysign/KeysignChainSpecific';
import { Spinner } from '../../../lib/ui/loaders/Spinner';
import { ChildrenProp } from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { getValueProviderSetup } from '../../../lib/ui/state/getValueProviderSetup';
import { StrictText } from '../../../lib/ui/text';
import { useDepositChainSpecificQuery } from '../queries/useDepositChainSpecificQuery';

export const {
  useValue: useDepositChainSpecific,
  provider: DepositChainSpecificValueProvider,
} = getValueProviderSetup<KeysignChainSpecific>('DepositChainSpecific');

export const DepositChainSpecificProvider: React.FC<ChildrenProp> = ({
  children,
}) => {
  const chainSpecificQuery = useDepositChainSpecificQuery();
  const { t } = useTranslation();

  return (
    <MatchQuery
      value={chainSpecificQuery}
      pending={() => <Spinner />}
      error={() => <StrictText>{t('failed_to_load')}</StrictText>}
      success={value => (
        <DepositChainSpecificValueProvider value={value}>
          {children}
        </DepositChainSpecificValueProvider>
      )}
    />
  );
};
