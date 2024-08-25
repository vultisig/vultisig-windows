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
import { Rate } from '../../model/price-rate';

const useVaultListViewModel = (walletCore: WalletCore | null) => {
  const [selectedVault] = useCurrentVault();
  const [coins, setCoins] = useState<Map<Chain, Coin[]>>(new Map());

  const [servicesMap, setServicesMap] = useState<Map<Chain, IService>>(
    new Map()
  );

  const [services, setServices] = useState<IService[]>([]);
  const [balances, setBalances] = useState<Map<Coin, Balance>>(new Map());
  const [priceRates, setPriceRates] = useState<Map<CoinMeta, Rate[]>>(
    new Map()
  );

  const fetchCoins = async (vault: storage.Vault) => {
    if (!walletCore) {
      console.error('WalletCore is not initialized');
      return;
    }

    const allChains: Chain[] = Object.values(Chain) as Chain[];
    const serviceMap = new Map<Chain, IService>();
    const balancePromises: Promise<void>[] = [];
    const priceRatePromises: Promise<void>[] = [];

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

      const priceRatesPromise = service.priceService.getPrices(tokensPerChain);
      if (priceRatesPromise) {
        priceRatePromises.push(
          priceRatesPromise
            .then((priceRates: Map<CoinMeta, Rate[]>) => {
              priceRates.forEach((rates, coinMeta) => {
                setPriceRates(prevPriceRates => {
                  const updatedPriceRates = new Map(prevPriceRates);
                  const existingRates = updatedPriceRates.get(coinMeta) || [];
                  // Use a Set to remove duplicates
                  const uniqueRates = Array.from(
                    new Set([...existingRates, ...rates])
                  );
                  updatedPriceRates.set(coinMeta, uniqueRates);
                  return updatedPriceRates;
                });
              });
            })
            .catch(error => {
              console.error(
                `Failed to fetch prices for chain ${chain}:`,
                error
              );
            })
        );
      } else {
        console.error(`getPrices returned undefined for chain ${chain}`);
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

    // Resolve all price promises as they complete
    Promise.allSettled(priceRatePromises).then(results => {
      results.forEach(result => {
        if (result.status === 'rejected') {
          console.error('Failed to fetch price:', result.reason);
        }
      });
    });

    setServicesMap(serviceMap);
    setServices(Array.from(serviceMap.values()));
  };

  useEffect(() => {
    if (selectedVault) {
      // console.log('Selected vault changed:', selectedVault);
      fetchCoins(selectedVault);
    }
  }, [selectedVault]);

  useEffect(() => {
    // console.log('Coins state updated:', coins);
  }, [coins]);

  useEffect(() => {
    // console.log('Balances state updated:', balances);
  }, [balances]);

  useEffect(() => {
    // console.log('Service Map state updated:', servicesMap);
  }, [servicesMap]);

  useEffect(() => {
    // console.log('Price Rates state updated:', priceRates);
  }, [priceRates]);

  return {
    coins,
    services,
    setServices,
    balances,
    setBalances,

    priceRates,
    setPriceRates,

    servicesMap,
    setServicesMap,
  };
};

export default useVaultListViewModel;
