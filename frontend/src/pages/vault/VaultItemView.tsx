import React from 'react';
import VaultList from '../../components/vaultList/VaultList';
import useVaultListViewModel from './VaultListViewModel';
import { useWalletCore } from '../../main';
import { Chain } from '../../model/chain';

const VaultItemView: React.FC = () => {
  const walletCore = useWalletCore();
  const { selectedVault, setSelectedVault, coins } =
    useVaultListViewModel(walletCore);

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
          {coins.size === 0 ? (
            <p>No coins available for this vault.</p>
          ) : (
            <ul>
              {Array.from(coins.entries()).map(([chain, coinArray]) => {
                const chainName = Chain[chain as keyof typeof Chain]; // Ensure correct access
                return (
                  <React.Fragment key={chain}>
                    {coinArray.map((coin, index) => (
                      <li
                        key={index}
                        className="flex items-center space-x-4 bg-blue-600 p-4 rounded-lg mb-4"
                      >
                        <div className="logo">
                          <div className="flex items-center justify-center w-12 h-12 bg-white text-black rounded-full">
                            {chainName ? chainName.substring(0, 1) : ''}
                          </div>
                        </div>

                        <div className="flex flex-col flex-1">
                          <div className="flex items-center justify-between">
                            <div className="chain-name">{chainName}</div>
                            <div className="flex items-center space-x-2 justify-end">
                              <button>Copy button</button>
                              <button>Show QRCode</button>
                              <button>Go to explorer</button>
                            </div>
                          </div>
                          <div className="address mt-2">{coin.address}</div>
                        </div>
                      </li>
                    ))}
                  </React.Fragment>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default VaultItemView;
