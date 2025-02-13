import { getSolanaClient } from '@core/chain/chains/solana/client';
import { PublicKey } from '@solana/web3.js';

type Input = {
  account: string;
  token: string;
};

export const getSolanaTokenAssociatedAccount = async ({
  account,
  token,
}: Input): Promise<PublicKey> => {
  const client = getSolanaClient();

  const { value } = await client.getTokenAccountsByOwner(
    new PublicKey(account),
    {
      mint: new PublicKey(token),
    }
  );

  if (!value) {
    throw new Error('No associated token account found');
  }

  return value[0].pubkey;
};
