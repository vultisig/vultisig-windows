import { useState, useEffect } from 'react';
import { storage } from '../../../wailsjs/go/models';
import { Chain } from '../../model/chain';
import { ServiceFactory } from '../../services/ServiceFactory';
import { IService } from '../../services/IService';
import { CoinMeta } from '../../model/coin-meta';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { WalletCore } from '@trustwallet/wallet-core';
import { TokensStore } from '../../services/Coin/CoinList';
import { Balance } from '../../model/balance';
import { useCurrentVault } from '../../vault/components/CurrentVaultProvider';

const useVaultListViewModel = (walletCore: WalletCore | null) => {
  const [selectedVault] = useCurrentVault();
  const [coins, setCoins] = useState<Map<Chain, Coin[]>>(new Map());
  const [services, setServices] = useState<IService[]>([]);
  const [balances, setBalances] = useState<Map<Coin, Balance>>(new Map());

  const fetchCoins = async (vault: storage.Vault) => {
    if (!walletCore) {
      console.error('WalletCore is not initialized');
      return;
    }

    const allChains: Chain[] = Object.values(Chain) as Chain[];
    const serviceMap = new Map<Chain, IService>();
    const balancePromises: Promise<void>[] = [];

    allChains.forEach(chain => {
      let service = serviceMap.get(chain);
      if (!service) {
        service = ServiceFactory.getService(chain, walletCore);
        serviceMap.set(chain, service);
      }

      if (!service) {
        console.error(`Service for chain ${chain} could not be initialized`);
        return;
      }

      const tokensPerChain = TokensStore.TokenSelectionAssets.filter(
        f => f.chain === chain
      );

      if (!tokensPerChain || tokensPerChain.length === 0) {
        console.error('No tokens found for chain:', chain);
        return;
      }

      const coinPromises = tokensPerChain.map(async f => {
        const coinMeta: CoinMeta = {
          chain,
          contractAddress: f.contractAddress,
          decimals: f.decimals,
          isNativeToken: f.isNativeToken,
          logo: f.logo,
          priceProviderId: f.priceProviderId,
          ticker: f.ticker,
        };

        const coinPromise = service!.coinService.createCoin(
          coinMeta,
          vault.public_key_ecdsa || '',
          vault.public_key_eddsa || '',
          vault.hex_chain_code || ''
        );

        return coinPromise.then(coin => {
          setCoins(prevCoins => {
            const updatedCoins = new Map(prevCoins);
            const existingCoins = updatedCoins.get(chain) || [];

            // Use a Set to remove duplicates
            const uniqueCoins = Array.from(new Set([...existingCoins, coin]));

            updatedCoins.set(chain, uniqueCoins);
            return updatedCoins;
          });

          const balancePromise = service?.balanceService?.getBalance(coin);
          if (balancePromise) {
            balancePromises.push(
              balancePromise.then(balance => {
                setBalances(prevBalances => {
                  const updatedBalances = new Map(prevBalances);
                  updatedBalances.set(coin, balance);
                  return updatedBalances;
                });
              })
            );
          }
        });
      });

      // Store the coin creation promises
      Promise.all(coinPromises).catch(error => {
        console.error(`Failed to fetch coins for chain ${chain}:`, error);
      });
    });

    // Resolve all balance promises as they complete
    Promise.allSettled(balancePromises).then(results => {
      results.forEach(result => {
        if (result.status === 'rejected') {
          console.error('Failed to fetch balance:', result.reason);
        }
      });
    });

    setServices(Array.from(serviceMap.values()));
  };

  useEffect(() => {
    if (selectedVault) {
      console.log('Selected vault changed:', selectedVault);
      fetchCoins(selectedVault);
    }
  }, [selectedVault]);

  useEffect(() => {
    console.log('Coins state updated:', coins);
  }, [coins]);

  useEffect(() => {
    console.log('Balances state updated:', balances);
  }, [balances]);

  return {
    coins,
    services,
    setServices,
    balances,
    setBalances,
  };
};

export default useVaultListViewModel;
