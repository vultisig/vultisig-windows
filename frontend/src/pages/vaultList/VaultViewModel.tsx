import { useState, useEffect } from 'react';
import { storage } from '../../../wailsjs/go/models';
import { Chain } from '../../model/chain';
import { ServiceFactory } from '../../services/ServiceFactory';
import { IService } from '../../services/IService';
import { CoinMeta } from '../../model/coin-meta';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { WalletCore } from '@trustwallet/wallet-core';

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

    console.log('Fetching coins for vault:', vault);
    const allChains: Chain[] = Object.values(Chain) as Chain[];
    console.log('All chains:', allChains);

    const filteredChains = allChains.filter(f => f == Chain.Arbitrum);

    const coinPromises = filteredChains.map(async chain => {
      console.log('Fetching coin for chain:', chain);
      const service = ServiceFactory.getService(chain, walletCore);

      const coinMeta: CoinMeta = {
        chain: chain,
        contractAddress: '',
        decimals: 0,
        isNativeToken: true,
        logo: '',
        priceProviderId: '',
        ticker: '',
      };

      console.log('CoinMeta:', coinMeta);
      const coin = await service.coinService.createCoin(
        coinMeta,
        vault.public_key_ecdsa || '',
        vault.public_key_eddsa || ''
      );
      console.log('Created coin:', coin);
      return coin;
    });

    try {
      const coinList = (await Promise.all(coinPromises)) || [];
      console.log('Coin list:', coinList);

      setCoins([...coinList]); // Use spread operator to ensure new reference

      const servicesList = coinList.map((_, index) =>
        ServiceFactory.getService(filteredChains[index], walletCore)
      );
      console.log('Services list:', servicesList);
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
