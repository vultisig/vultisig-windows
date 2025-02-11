import { CosmosChain } from '@core/chain/Chain';
import { queryUrl } from '@lib/utils/query/queryUrl';

import { getCosmosClient } from '../../chain/cosmos/client/getCosmosClient';
import { cosmosFeeCoinDenom } from '../../chain/cosmos/cosmosFeeCoinDenom';
import { getCosmosWasmTokenBalanceUrl } from '../../chain/cosmos/cosmosRpcUrl';
import { isFeeCoin } from '../utils/isFeeCoin';
import { CoinBalanceResolver } from './CoinBalanceResolver';

export const getCosmosCoinBalance: CoinBalanceResolver<
  CosmosChain
> = async input => {
  if (
    isFeeCoin(input) ||
    ['ibc/', 'factory/'].some(prefix => input.id.includes(prefix))
  ) {
    const client = await getCosmosClient(input.chain);
    const denom = cosmosFeeCoinDenom[input.chain];
    const balance = await client.getBalance(input.address, denom);
    return BigInt(balance.amount);
  }

  const url = getCosmosWasmTokenBalanceUrl(input);
  const { data } = await queryUrl<WasmQueryResponse>(url);
  return BigInt(data.balance ?? 0);
};

interface WasmQueryResponse {
  data: {
    balance: string;
  };
}
