import { CoinBalanceResolver } from "./CoinBalanceResolver";
import { getRippleAccountInfo } from "@core/chain/chains/ripple/account/getRippleAccountInfo";

export const getRippleCoinBalance: CoinBalanceResolver = async (input) => {
  const { Balance } = await getRippleAccountInfo(input.address);

  return BigInt(Balance);
};
