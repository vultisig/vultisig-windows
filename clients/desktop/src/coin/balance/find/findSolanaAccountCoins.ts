// TODO: REWRITE THIS
import { Chain } from '@core/chain/Chain';
import { ChainAccount } from '@core/chain/ChainAccount';
import { getSplAccounts } from '@core/chain/chains/solana/spl/getSplAccounts';
import { Coin } from '@core/chain/coin/Coin';
import { queryUrl } from '@lib/utils/query/queryUrl';
import { AccountLayout } from '@solana/spl-token';

export const findSolanaAccountCoins = async (account: ChainAccount) => {
  if (!account.address) {
    throw new Error('Invalid native token: Address is required');
  }

  const accounts = await getSplAccounts(account.address);
  if (!accounts.length) {
    return [];
  }

  const tokenAddresses = accounts.map(account =>
    AccountLayout.decode(account.account.data).mint.toString()
  );
  const tokenInfos = await fetchSolanaTokenInfoList(tokenAddresses);

  return Object.entries(tokenInfos)
    .filter(([_, info = {}]) =>
      isValidToken({
        coingeckoId: info.tokenList?.extensions?.coingeckoId,
        symbol: info.tokenList?.symbol,
        decimals: info.decimals,
      })
    )
    .map(([address, info]) => {
      const token: Coin = {
        chain: Chain.Solana,
        ticker: (info.tokenList?.symbol || '').toUpperCase(),
        logo: info.tokenList?.image || '',
        decimals: info.decimals || 0,
        id: address,
        priceProviderId: info.tokenList?.extensions?.coingeckoId || '',
      };

      return token;
    });
};

const fetchSolanaTokenInfoList = async (
  contractAddresses: string[]
): Promise<Record<string, any>> => {
  const results: Record<string, any> = {};
  const missingTokens: string[] = [];

  const solanaFmResults = await queryUrl('https://api.solana.fm/v1/tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tokens: contractAddresses,
    }),
  });

  Object.assign(results, solanaFmResults);

  missingTokens.push(...contractAddresses.filter(addr => !results[addr]));

  if (missingTokens.length) {
    console.warn(`Missing tokens from Solana.fm: ${missingTokens.join(', ')}`);

    const fallbackResults = await fetchFromJupiterBatch(missingTokens);

    fallbackResults.forEach(({ address, data }) => {
      if (data) results[address] = data;
    });
  }
  return results;
};

const fetchFromJupiterBatch = async (
  contractAddresses: string[]
): Promise<{ address: string; data: any }[]> => {
  const fetchPromises = contractAddresses.map(address =>
    fetchFromJupiter(address)
      .then(data => ({ address, data }))
      .catch(error => {
        console.error(
          `Error fetching token ${address} from Jupiter API: ${error.message}`
        );
        return { address, data: null };
      })
  );

  return Promise.all(fetchPromises);
};

const fetchFromJupiter = async (contractAddress: string): Promise<any> => {
  const url = `https://api.jup.ag/token/${contractAddress}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return await response.json();
};

const isValidToken = (tokenInfo: {
  coingeckoId?: string;
  symbol?: string;
  decimals?: number;
}): boolean => {
  if (!tokenInfo?.symbol || !tokenInfo?.decimals || !tokenInfo?.coingeckoId) {
    console.warn(
      `Skipping token with incomplete metadata: ${JSON.stringify(tokenInfo)}`
    );
    return false;
  }
  return true;
};
