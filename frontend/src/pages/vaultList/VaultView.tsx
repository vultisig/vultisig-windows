import React, { useEffect, useState } from 'react';
import VaultList from '../../components/vaultList/VaultList';
import { storage } from '../../../wailsjs/go/models';

const VaultView: React.FC = () => {
  const [selectedVault, setSelectedVault] = useState<storage.Vault | null>(
    null
  );
  const [coins, setCoins] = useState<storage.Coin[]>([]); // Assuming you have a Coin type

  const fetchCoins = async (vault: storage.Vault) => {
    try {
      setCoins(vault.coins || []);
    } catch (error) {
      console.error('Failed to fetch coins:', error);
    }
  };

  useEffect(() => {
    if (selectedVault) {
      fetchCoins(selectedVault);
    }
  }, [selectedVault]);

  return (
    <div className="relative">
      <VaultList onSelectVault={setSelectedVault} />
      {selectedVault && (
        <div>
          <h2>{selectedVault.name} Coins</h2>
          <ul>
            {coins.map((coin, index) => (
              <li key={index}>
                {coin.ticker} - {coin.raw_balance}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VaultView;
