import { CosmosChain } from "@core/chain/Chain";
import { isFeeCoin } from "@core/chain/coin/utils/isFeeCoin";
import { queryUrl } from "@lib/utils/query/queryUrl";

import { CoinBalanceResolver } from "./CoinBalanceResolver";
import { getCosmosClient } from "../../chains/cosmos/client";
import { cosmosFeeCoinDenom } from "../../chains/cosmos/cosmosFeeCoinDenom";
import { getCosmosWasmTokenBalanceUrl } from "../../chains/cosmos/cosmosRpcUrl";

export const getCosmosCoinBalance: CoinBalanceResolver<CosmosChain> = async (
  input,
) => {
  if (
    isFeeCoin(input) ||
    ["ibc/", "factory/"].some((prefix) => input.id.includes(prefix))
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
