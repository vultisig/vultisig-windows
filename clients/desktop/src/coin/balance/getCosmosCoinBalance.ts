import { Fetch } from '../../../wailsjs/go/utils/GoHttp';
import { cosmosFeeCoinDenom } from '../../chain/cosmos/cosmosFeeCoinDenom';
import { getCosmosBalanceUrl } from '../../chain/cosmos/cosmosRpcUrl';
import { isNativeCoin } from '../../chain/utils/isNativeCoin';
import { CosmosChain } from '../../model/chain';
import { GetCoinBalanceInput } from './GetCoinBalanceInput';

export const getCosmosCoinBalance = async (
  input: GetCoinBalanceInput<CosmosChain>
) => {
  const url = getCosmosBalanceUrl(input);

  const { balances }: CosmosBalanceResponse = await Fetch(url);

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
};

interface CosmosBalance {
  amount: string;
  denom: string;
}

interface CosmosBalanceResponse {
  balances: CosmosBalance[];
}
