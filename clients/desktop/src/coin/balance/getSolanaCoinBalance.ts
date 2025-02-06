import { Address } from '@solana/web3.js';

import { getSolanaClient } from '../../chain/solana/client/getSolanaClient';
import { getSplAccounts } from '../../chain/solana/client/getSplAccounts';
import { isNativeCoin } from '../../chain/utils/isNativeCoin';
import { CoinBalanceResolver } from './CoinBalanceResolver';

export const getSolanaCoinBalance: CoinBalanceResolver = async input => {
  const client = getSolanaClient();

  if (isNativeCoin(input)) {
    const { value } = await client.getBalance(input.address as Address).send();

    return value.valueOf();
  }

  const accounts = await getSplAccounts(input.address);

  const tokenAccount = accounts.find(
    account => account.account.data.parsed.info.mint === input.id
  );

  const tokenAmount =
    tokenAccount?.account?.data?.parsed?.info?.tokenAmount?.amount;

  return BigInt(tokenAmount ?? 0);
};
