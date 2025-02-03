import { formatAmount } from '@lib/utils/formatAmount';
import { useTranslation } from 'react-i18next';

import { useEvmBaseFeeQuery } from '../../../../../../chain/evm/queries/useEvmBaseFeeQuery';
import { gwei } from '../../../../../../chain/tx/fee/utils/evm';
import { fromChainAmount } from '../../../../../../chain/utils/fromChainAmount';
import { InputContainer } from '../../../../../../lib/ui/inputs/InputContainer';
import { InputLabel } from '../../../../../../lib/ui/inputs/InputLabel';
import { Spinner } from '../../../../../../lib/ui/loaders/Spinner';
import { MatchQuery } from '../../../../../../lib/ui/query/components/MatchQuery';
import { EvmChain } from '../../../../../../model/chain';
import { useCurrentSendCoin } from '../../../../state/sendCoin';
import { FeeContainer } from '../../FeeContainer';

export const BaseFee = () => {
  const { t } = useTranslation();

  const [{ chain }] = useCurrentSendCoin();

  const query = useEvmBaseFeeQuery(chain as EvmChain);

  return (
    <InputContainer>
      <InputLabel>
        {t('current_base_fee')} ({t('gwei')})
      </InputLabel>
      <FeeContainer>
        <MatchQuery
          value={query}
          success={data => formatAmount(fromChainAmount(data, gwei.decimals))}
          error={() => null}
          pending={() => <Spinner />}
        />
      </FeeContainer>
    </InputContainer>
  );
};
