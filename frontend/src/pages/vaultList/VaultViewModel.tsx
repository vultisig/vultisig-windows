import { useState, useEffect } from 'react';
import { storage } from '../../../wailsjs/go/models';
import { Chain } from '../../model/chain';
import { ServiceFactory } from '../../services/ServiceFactory';
import { IService } from '../../services/IService';
import { CoinMeta } from '../../model/coin-meta';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { WalletCore } from '@trustwallet/wallet-core';
import { TokensStore } from '../../services/Coin/CoinList';

const useVaultViewModel = (walletCore: WalletCore | null) => {
  const [selectedVault, setSelectedVault] = useState<storage.Vault | null>(
    null
  );
  const [coins, setCoins] = useState<Coin[]>([]);
  const [services, setServices] = useState<IService[]>([]);

  const fetchCoins = async (vault: storage.Vault) => {
    if (!walletCore) {
      console.error('WalletCore is not initialized');
      return;
    }

    const allChains: Chain[] = Object.values(Chain) as Chain[];

    const filteredChains = allChains;

    const coinPromises = filteredChains.map(async chain => {
      const service = ServiceFactory.getService(chain, walletCore);

      const tokensPerChain = TokensStore.TokenSelectionAssets.filter(
        f => f.chain === chain
      );

      if (!tokensPerChain || tokensPerChain.length === 0) {
        console.error('No tokens found for chain:', chain);
        return;
      }

      const tokens = await Promise.all(
        tokensPerChain.map(async f => {
          const coinMeta: CoinMeta = {
            chain: chain,
            contractAddress: f.contractAddress,
            decimals: f.decimals,
            isNativeToken: f.isNativeToken,
            logo: f.logo,
            priceProviderId: f.priceProviderId,
            ticker: f.ticker,
          };

          const coin = await service.coinService.createCoin(
            coinMeta,
            vault.public_key_ecdsa || '',
            vault.public_key_eddsa || '',
            vault.hex_chain_code || ''
          );

          return coin;
        })
      );

      return tokens;
    });

    try {
      const coinList = (await Promise.all(coinPromises)) || [];

      console.log('Coin list:', coinList);

      const flattenedCoinList = coinList.flatMap(f => f || []);

      setCoins([...flattenedCoinList]); // Use spread operator to ensure new reference

      const servicesList = coinList.map((_, index) =>
        ServiceFactory.getService(filteredChains[index], walletCore)
      );

      setServices(servicesList);
    } catch (error) {
      console.error('Failed to fetch coins:', error);
    }
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

  return {
    selectedVault,
    setSelectedVault,
    coins,
    services,
    setServices,
  };
};

export default useVaultViewModel;
