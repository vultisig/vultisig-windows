import { CosmosChain } from "@core/chain/Chain";
import { isFeeCoin } from "@core/chain/coin/utils/isFeeCoin";
import { queryUrl } from "@lib/utils/query/queryUrl";

import { CoinBalanceResolver } from "./CoinBalanceResolver";
import { getCosmosClient } from "../../chains/cosmos/client";
import { cosmosFeeCoinDenom } from "../../chains/cosmos/cosmosFeeCoinDenom";
import { getCosmosWasmTokenBalanceUrl } from "../../chains/cosmos/cosmosRpcUrl";

const isCosmosNativeCoin = (id: string) => {
  if (["ibc/", "factory/"].some((prefix) => id.includes(prefix))) {
    return true;
  }

  const isContractAddress = id.match(/^[a-zA-Z0-9]{40,}/) !== null;

  return !isContractAddress;
};

export const getCosmosCoinBalance: CoinBalanceResolver<CosmosChain> = async (
  input,
) => {
  if (isFeeCoin(input) || isCosmosNativeCoin(input.id)) {
    const client = await getCosmosClient(input.chain);
    const denom = cosmosFeeCoinDenom[input.chain] ?? input.id;
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
