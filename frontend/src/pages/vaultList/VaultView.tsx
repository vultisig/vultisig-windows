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

  return (
    <div className="relative">
      <div className="mb-12">
        <VaultList
          onSelectVault={setSelectedVault}
          selectedVaultName={selectedVault ? selectedVault.name : null}
        />
      </div>
      {selectedVault && (
        <div className="text-white px-4 py-4">
          {coins.length === 0 ? (
            <p>No coins available for this vault.</p>
          ) : (
            <ul>
              {coins.map((coin, index) => (
                <li
                  key={index}
                  className="flex items-center space-x-4 bg-blue-600 p-4 rounded-lg mb-4"
                >
                  <div className="logo">
                    <div className="flex items-center justify-center w-12 h-12 bg-white text-black rounded-full">
                      {coin.chain.toString().substring(0, 1)}
                    </div>
                  </div>

                  <div className="flex flex-col flex-1">
                    <div className="flex items-center justify-between">
                      <div className="chain-name">{coin.chain.toString()}</div>
                      <div className="flex items-center space-x-2 justify-end">
                        <div className="priceInDecimal text-right">0.0</div>
                        <div className="priceInFiat text-right">{'$ 0.00'}</div>
                      </div>
                    </div>
                    <div className="address mt-2">{coin.address}</div>
                  </div>
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
