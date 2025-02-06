import { queryUrl } from '@lib/utils/query/queryUrl';

import { cosmosFeeCoinDenom } from '../../chain/cosmos/cosmosFeeCoinDenom';
import {
  getCosmosBalanceUrl,
  getCosmosWasmTokenBalanceUrl,
} from '../../chain/cosmos/cosmosRpcUrl';
import { isNativeCoin } from '../../chain/utils/isNativeCoin';
import { CosmosChain } from '../../model/chain';
import { CoinBalanceResolver } from './CoinBalanceResolver';

export const getCosmosCoinBalance: CoinBalanceResolver<
  CosmosChain
> = async input => {
  if (
    isNativeCoin(input) ||
    ['ibc/', 'factory/'].some(prefix => input.id.includes(prefix))
  ) {
    const url = getCosmosBalanceUrl(input);

    const { balances } = await queryUrl<CosmosBalanceResponse>(url);

    const denom = cosmosFeeCoinDenom[input.chain];

    const balance = balances.find(balance => {
      if (isNativeCoin(input)) {
        if (balance.denom.toLowerCase() === denom) {
          return balance.amount;
        }
      } else {
        if (balance.denom.toLowerCase() === input.id.toLowerCase()) {
          return balance.amount;
        }
      }
    });

    return BigInt(balance?.amount ?? 0);
  }

  const url = getCosmosWasmTokenBalanceUrl(input);

  const { data } = await queryUrl<WasmQueryResponse>(url);

  return BigInt(data.balance ?? 0);
};

interface CosmosBalance {
  amount: string;
  denom: string;
}

interface CosmosBalanceResponse {
  balances: CosmosBalance[];
}

interface WasmQueryResponse {
  data: {
    balance: string;
  };
}
