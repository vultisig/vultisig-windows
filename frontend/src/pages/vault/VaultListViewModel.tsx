import { useState, useEffect } from 'react';
import { storage } from '../../../wailsjs/go/models';
import { Chain } from '../../model/chain';
import { ServiceFactory } from '../../services/ServiceFactory';
import { IService } from '../../services/IService';
import { CoinMeta } from '../../model/coin-meta';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { WalletCore } from '@trustwallet/wallet-core';
import { TokensStore } from '../../services/Coin/CoinList';

const useVaultListViewModel = (walletCore: WalletCore | null) => {
  const [selectedVault, setSelectedVault] = useState<storage.Vault | null>(
    null
  );
  const [coins, setCoins] = useState<Map<Chain, Coin[]>>(new Map());
  const [services, setServices] = useState<IService[]>([]);

  const fetchCoins = async (vault: storage.Vault) => {
    if (!walletCore) {
      console.error('WalletCore is not initialized');
      return;
    }

    const allChains: Chain[] = Object.values(Chain) as Chain[];

    const filteredChains = allChains;

    const newCoinsMap = new Map<Chain, Coin[]>();

    const coinPromises = filteredChains.map(async chain => {
      const service = ServiceFactory.getService(chain, walletCore);

      const tokensPerChain = TokensStore.TokenSelectionAssets.filter(
        f => f.chain === chain
      );

      if (!tokensPerChain || tokensPerChain.length === 0) {
        console.error('No tokens found for chain:', chain);
        return [];
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

      newCoinsMap.set(chain, tokens); // Set the chain's tokens in the new Map

      return tokens;
    });

    try {
      await Promise.all(coinPromises);

      setCoins(newCoinsMap);

      const servicesList = filteredChains.map(chain =>
        ServiceFactory.getService(chain, walletCore)
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

export default useVaultListViewModel;
