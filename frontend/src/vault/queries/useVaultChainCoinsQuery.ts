import { useQuery } from '@tanstack/react-query';
import { TokensStore } from '../../services/Coin/CoinList';
import { useCurrentVaultId } from '../state/useCurrentVaultId';
import { useAsserWalletCore } from '../../main';
import { Chain } from '../../model/chain';
import { useAssertCurrentVault } from '../state/useCurrentVault';
import { CoinAmount, CoinInfo, CoinKey } from '../../coin/Coin';
import { EntityWithPrice } from '../../chain/EntityWithPrice';
import { CoinMeta } from '../../model/coin-meta';
import { Fiat } from '../../model/fiat';
import { getChainEntityIconPath } from '../../chain/utils/getChainEntityIconPath';
import { CoinServiceFactory } from '../../services/Coin/CoinServiceFactory';
import { PriceServiceFactory } from '../../services/Price/PriceServiceFactory';
import { BalanceServiceFactory } from '../../services/Balance/BalanceServiceFactory';

export type VaultChainCoin = CoinKey &
  CoinAmount &
  CoinInfo &
  Partial<EntityWithPrice>;

export const useVaultChainCoinsQuery = (chain: Chain) => {
  const vaultId = useCurrentVaultId();
  const vault = useAssertCurrentVault();

  const walletCore = useAsserWalletCore();

  return useQuery({
    queryKey: ['vaultChainCoins', vaultId, chain],
    queryFn: async () => {
      const tokens = TokensStore.TokenSelectionAssets.filter(
        token => token.chain === chain
      );

      if (!walletCore) {
        throw new Error('WalletCore is not initialized');
      }

      if (!chain) {
        throw new Error('Chain is not provided');
      }

      const coinService = CoinServiceFactory.createCoinService(
        chain,
        walletCore
      );
      const priceService = PriceServiceFactory.createPriceService(
        chain,
        walletCore
      );
      const balanceService = BalanceServiceFactory.createBalanceService(chain);

      const prices = await priceService.getPrices(tokens);

      return Promise.all(
        tokens.map(async token => {
          const coin = await coinService.createCoin(
            token,
            vault.public_key_ecdsa || '',
            vault.public_key_eddsa || '',
            vault.hex_chain_code || ''
          );

          const balance = await balanceService.getBalance(coin);

          const price = prices
            .get(CoinMeta.sortedStringify(token))
            ?.find(rate => rate.fiat === Fiat.USD)?.value;

          const result: VaultChainCoin = {
            id: token.ticker,
            chainId: chain,
            amount: balance.rawAmount,
            decimals: token.decimals,
            name: token.logo,
            symbol: token.ticker,
            icon: getChainEntityIconPath(coin.logo),
            price,
          };

          return result;
        })
      );
    },
  });
};
