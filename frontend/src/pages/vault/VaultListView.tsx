/* eslint-disable */
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import VaultList from '../../components/vaultList/VaultList';
import useVaultListViewModel from './VaultListViewModel';
import { useWalletCore } from '../../main';
import { Chain } from '../../model/chain';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';

const VaultListView: React.FC = () => {
  const walletCore = useWalletCore();
  const navigate = useNavigate(); // Initialize useNavigate hook
  const { selectedVault, setSelectedVault, coins } =
    useVaultListViewModel(walletCore);

  if (!walletCore) {
    return <div>Loading WalletCore...</div>;
  }

  const handleChainClick = (chain: Chain, coinArray: Coin[]) => {
    navigate(`/vault/item/detail/${chain}`, {
      state: { coins: coinArray }, // Passing the coin array as state
    });
  };

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
                const chainName = Chain[chain as keyof typeof Chain];
                return (
                  <React.Fragment key={chain}>
                    {coinArray
                      .filter(f => f.isNativeToken)
                      .map((coin, index) => (
                        <li
                          key={index}
                          className="flex items-center space-x-4 bg-blue-600 p-4 rounded-lg mb-4 cursor-pointer"
                          onClick={() => handleChainClick(chain, coinArray)}
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
                                {coinArray.filter(f => !f.isNativeToken)
                                  .length === 0 ? (
                                  <div className="priceInDecimal text-right">
                                    0.0
                                  </div>
                                ) : (
                                  <div className="badgeTokenCount text-right text-neutral-100 bg-blue-400 px-3 py-1 rounded-full">
                                    {
                                      coinArray.filter(f => !f.isNativeToken)
                                        .length
                                    }{' '}
                                    assets
                                  </div>
                                )}
                                <div className="priceInFiat text-right">
                                  <strong>{'US$ 0.00'}</strong>
                                </div>
                              </div>
                            </div>
                            <div className="address mt-2 text-turquoise-600">
                              {coin.address}
                            </div>
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

export default VaultListView;
