import { queryUrl } from '@lib/utils/query/queryUrl';

import { toChainAmount } from '../../chain/utils/toChainAmount';
import { Chain } from '../../model/chain';
import { Endpoint } from '../../services/Endpoint';
import { chainFeeCoin } from '../chainFeeCoin';
import { CoinBalanceResolver } from './CoinBalanceResolver';

interface PolkadotAccountBalance {
  data: {
    account: {
      balance: number;
    };
  };
}

export const getPolkadotCoinBalance: CoinBalanceResolver = async input => {
  const { data } = await queryUrl<PolkadotAccountBalance>(
    Endpoint.polkadotServiceBalance,
    {
      method: 'POST',
      body: JSON.stringify({ key: input.address }),
    }
  );

  return toChainAmount(
    data.account.balance,
    chainFeeCoin[Chain.Polkadot].decimals
  );
};
