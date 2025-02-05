import { callRpc } from '../../chain/rpc/callRpc';
import { isNativeCoin } from '../../chain/utils/isNativeCoin';
import { Endpoint } from '../../services/Endpoint';
import { CoinBalanceResolver } from './CoinBalanceResolver';

interface SolanaAccountBalance {
  value: number | null;
  context: {
    slot: number;
  };
}

interface TokenAccountInfo {
  pubkey: string;
  account: {
    data: {
      program: string;
      parsed: {
        info: {
          mint: string;
          owner: string;
          tokenAmount: {
            amount: string;
            decimals: number;
            uiAmount: number;
          };
        };
        type: string;
      };
    };
    executable: boolean;
    lamports: number;
    owner: string;
    rentEpoch: number;
  };
}

const SPL_TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

export const getSolanaCoinBalance: CoinBalanceResolver = async input => {
  if (isNativeCoin(input)) {
    const { value } = await callRpc<SolanaAccountBalance>({
      url: Endpoint.solanaServiceRpc,
      method: 'getBalance',
      params: [input.address],
    });

    return BigInt(value ?? 0);
  }

  const accounts = await callRpc<TokenAccountInfo[]>({
    url: Endpoint.solanaServiceRpc,
    method: 'getTokenAccountsByOwner',
    params: [
      input.address,
      {
        programId: SPL_TOKEN_PROGRAM_ID,
      },
      {
        encoding: 'jsonParsed',
      },
    ],
  });

  const tokenAccount = accounts.find(
    account => account.account.data.parsed.info.mint === input.id
  );
  const tokenAmount =
    tokenAccount?.account?.data?.parsed?.info?.tokenAmount?.amount;
  return BigInt(tokenAmount ?? 0);
};
