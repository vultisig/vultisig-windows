import { Address } from '@solana/web3.js';

import { getSolanaRpcClient } from './getSolanaRpcClient';

const SPL_TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

export const getSplAccounts = async (address: string) => {
  const client = getSolanaRpcClient();

  const { value } = await client
    .getTokenAccountsByOwner(
      address as Address,
      {
        programId: SPL_TOKEN_PROGRAM_ID as Address,
      },
      {
        encoding: 'jsonParsed',
      }
    )
    .send();

  return value;
};
