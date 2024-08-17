import React from 'react';
import VaultList from '../../components/vaultList/VaultList';
import useVaultViewModel from './VaultViewModel';
import { useWalletCore } from '../../main';

const VaultView: React.FC = () => {
  const walletCore = useWalletCore();
  const { selectedVault, setSelectedVault, coins } =
    useVaultViewModel(walletCore);

  if (!walletCore) {
    return <div>Loading WalletCore...</div>;
  }

  console.log('selected vault FRONT END', selectedVault);
  console.log('coins FRONT END', coins);

  return (
    <div className="relative">
      <VaultList
        onSelectVault={setSelectedVault}
        selectedVaultName={selectedVault ? selectedVault.name : null}
      />
      <br />
      <br />
      <br />
      {selectedVault && (
        <div>
          <h2>{selectedVault.name} Coins</h2>
          {coins.length === 0 ? (
            <p>No coins available for this vault.</p>
          ) : (
            <ul>
              {/* Remove the console.log statement */}
              {coins.map((coin, index) => (
                <li key={index} className="text-white">
                  {coin.address} - {coin.chain.toString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default VaultView;
