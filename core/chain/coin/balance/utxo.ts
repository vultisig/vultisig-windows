import { UtxoChain } from "@core/chain/Chain";
import { CoinBalanceResolver } from "./CoinBalanceResolver";
import { getUtxoAddressInfo } from "../../chains/utxo/client/getUtxoAddressInfo";

export const getUtxoCoinBalance: CoinBalanceResolver<UtxoChain> = async (
  input,
) => {
  const { data } = await getUtxoAddressInfo(input);

  return BigInt(data[input.address].address.balance);
};
