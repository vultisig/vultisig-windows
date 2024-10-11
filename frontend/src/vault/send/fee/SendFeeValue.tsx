import { useTranslation } from 'react-i18next';

import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { Spinner } from '../../../lib/ui/loaders/Spinner';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { StrictText, Text } from '../../../lib/ui/text';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { useAssertCurrentVaultNativeCoin } from '../../state/useCurrentVault';
import { useSpecificSendTxInfoQuery } from '../queries/useSpecificSendTxInfoQuery';
import { useCurrentSendCoin } from '../state/sendCoin';

export const SendFeeValue = () => {
  const { t } = useTranslation();

  const txSpecificInfoQuery = useSpecificSendTxInfoQuery();
  const [coinKey] = useCurrentSendCoin();
  const { decimals, ticker } = useAssertCurrentVaultNativeCoin(coinKey.chainId);

  return (
    <StrictText>
      <QueryDependant
        query={txSpecificInfoQuery}
        pending={() => <Spinner />}
        error={() => <Text>{t('failed_to_load')}</Text>}
        success={({ fee }) => {
          const feeAmount = fromChainAmount(fee, decimals);

          return formatAmount(feeAmount, ticker);
        }}
      />
    </StrictText>
  );
};
