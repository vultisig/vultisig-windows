import { isFeeCoin } from "@core/chain/coin/utils/isFeeCoin";
import { CoinBalanceResolver } from "./CoinBalanceResolver";
import { getSolanaClient } from "../../chains/solana/client";
import { getSplAccounts } from "../../chains/solana/spl/getSplAccounts";
import { PublicKey } from "@solana/web3.js";
import { AccountLayout } from "@solana/spl-token";

export const getSolanaCoinBalance: CoinBalanceResolver = async (input) => {
  const client = getSolanaClient();

  if (isFeeCoin(input)) {
    const value = await client.getBalance(new PublicKey(input.address));
    return BigInt(value);
  }

  const accounts = await getSplAccounts(input.address);

  const tokenAccount = accounts.find((account) => {
    const decodedData = AccountLayout.decode(account.account.data);
    return decodedData.mint.toBase58() === input.id;
  });

  const tokenAmount = tokenAccount
    ? BigInt(AccountLayout.decode(tokenAccount.account.data).amount)
    : BigInt(0);

  return tokenAmount;
};
