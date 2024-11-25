import { useTranslation } from 'react-i18next';

import { useEvmBaseFeeQuery } from '../../../../../../chain/evm/queries/useEvmBaseFeeQuery';
import { gwei } from '../../../../../../chain/tx/fee/utils/evm';
import { fromChainAmount } from '../../../../../../chain/utils/fromChainAmount';
import { InputContainer } from '../../../../../../lib/ui/inputs/InputContainer';
import { InputLabel } from '../../../../../../lib/ui/inputs/InputLabel';
import { Spinner } from '../../../../../../lib/ui/loaders/Spinner';
import { QueryDependant } from '../../../../../../lib/ui/query/components/QueryDependant';
import { formatAmount } from '../../../../../../lib/utils/formatAmount';
import { EvmChain } from '../../../../../../model/chain';
import { useCurrentSendCoin } from '../../../../state/sendCoin';
import { FeeContainer } from '../../FeeContainer';

export const BaseFee = () => {
  const { t } = useTranslation();

  const [{ chainId }] = useCurrentSendCoin();

  const query = useEvmBaseFeeQuery(chainId as EvmChain);

  return (
    <InputContainer>
      <InputLabel>
        {t('current_base_fee')} ({t('gwei')})
      </InputLabel>
      <FeeContainer>
        <QueryDependant
          query={query}
          success={data => formatAmount(fromChainAmount(data, gwei.decimals))}
          error={() => null}
          pending={() => <Spinner />}
        />
      </FeeContainer>
    </InputContainer>
  );
};
