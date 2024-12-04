import { useQuery } from '@tanstack/react-query';

import { TokensStore } from '../../../services/Coin/CoinList';
import { getSwapPairs } from '../../../services/Thorwallet';
import {
  convertChainSymbolToChain,
  convertChainToChainTicker,
} from '../../../utils/crypto';
import { useCurrentVaultAddreses } from '../../../vault/state/currentVault';
import { nativeTokenForChain } from '../../../vault/utils/helpers';
import { Coin } from '../../types/coin';

export default function useSwapPairs(
  chain: string,
  ticker: string,
  contractAddress: string
) {
  const addresses = useCurrentVaultAddreses();
  return useQuery({
    queryKey: ['swap-pairs', `${chain}.${ticker}`],
    queryFn: async () => {
      const swapPairs = await getSwapPairs(chain, ticker, contractAddress);
      const pairs: Coin[] = [];
      swapPairs
        .filter(asset => !asset.isSynth)
        .forEach(pair => {
          const coin = TokensStore.TokenSelectionAssets.find(
            asset =>
              asset.chain === convertChainSymbolToChain(pair.chain) &&
              asset.ticker === pair.ticker
          );
          if (coin) {
            pairs.push({
              chain: coin.chain,
              address:
                addresses[
                  convertChainSymbolToChain(
                    coin.chain
                  ) as keyof typeof addresses
                ],
              contract_address: coin.contractAddress || '',
              decimals: coin.decimals,
              hex_public_key: '',
              id: `${convertChainToChainTicker(coin.chain)}:${nativeTokenForChain[convertChainToChainTicker(coin.chain)] === coin.ticker ? coin.ticker : coin.contractAddress}:${addresses[convertChainSymbolToChain(coin.chain) as keyof typeof addresses]}`,
              is_native_token:
                nativeTokenForChain[convertChainToChainTicker(coin.chain)] ===
                coin.ticker,
              price_provider_id: coin.priceProviderId,
              logo: pair.icon,
              ticker: coin.ticker,
            });
          }
        });
      return pairs;
    },
  });
}
