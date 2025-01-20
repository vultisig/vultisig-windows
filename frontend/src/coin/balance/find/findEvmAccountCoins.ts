import { Fetch } from '../../../../wailsjs/go/utils/GoHttp';
import { ChainAccount } from '../../../chain/ChainAccount';
import { getEvmChainId } from '../../../chain/evm/chainInfo';
import { EvmChain } from '../../../model/chain';
import { CoinMeta } from '../../../model/coin-meta';
import { Endpoint } from '../../../services/Endpoint';
import { oneInchTokenToCoinMeta } from '../../oneInch/token';

export const findEvmAccountCoins = async (account: ChainAccount<EvmChain>) => {
  const oneInchChainId = getEvmChainId(account.chain);
  const oneInchEndpoint = Endpoint.fetch1InchsTokensBalance(
    oneInchChainId.toString(),
    account.address
  );

  const balanceData = await Fetch(oneInchEndpoint);

  await new Promise(resolve => setTimeout(resolve, 1000)); // We have some rate limits on 1 inch, so I will wait a bit

  // Filter tokens with non-zero balance
  const nonZeroBalanceTokenAddresses = Object.entries(balanceData)
    .filter(([_, balance]) => BigInt(balance as string) > 0n) // Ensure the balance is non-zero
    .map(([tokenAddress]) => tokenAddress)
    .filter(
      tokenAddress =>
        tokenAddress !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    );

  if (nonZeroBalanceTokenAddresses.length === 0) {
    return [];
  }

  // Fetch token information for the non-zero balance tokens
  const tokenInfoEndpoint = Endpoint.fetch1InchsTokensInfo(
    oneInchChainId.toString(),
    nonZeroBalanceTokenAddresses
  );

  const tokenInfoData = await Fetch(tokenInfoEndpoint);

  // Map the fetched token information to CoinMeta[] format
  return nonZeroBalanceTokenAddresses
    .map(tokenAddress => {
      const tokenInfo = tokenInfoData[tokenAddress];
      if (!tokenInfo) return null;

      return oneInchTokenToCoinMeta({
        token: tokenInfo,
        chain: account.chain,
      });
    })
    .filter((token): token is CoinMeta => token !== null);
};
