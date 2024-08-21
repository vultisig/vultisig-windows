/* eslint-disable */
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCopy,
  faQrcode,
  faCube,
  faArrowLeft,
  faSyncAlt,
} from '@fortawesome/free-solid-svg-icons';
import { Balance } from '../../model/balance';

const VaultItemView: React.FC = () => {
  const { chain } = useParams<{ chain: string }>(); // Get the chain from the URL
  const location = useLocation();
  const { coins, balances } = location.state as {
    coins: Coin[];
    balances: Map<Coin, Balance>;
  };

  // Separate native token and other tokens
  const nativeToken = coins.find(coin => coin.isNativeToken);
  const otherTokens = coins.filter(coin => !coin.isNativeToken);

  return (
    <div className="relative text-white p-4">
      {/* TODO: Make this a component */}
      <div className="flex items-center justify-between mb-4">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center justify-center w-8 h-8 bg-transparent text-white"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        {/* Chain Name */}
        <span className="text-lg font-bold text-center flex-1">{chain}</span>

        {/* Refresh Button */}
        <button className="flex items-center justify-center w-4 h-4 bg-white text-black text-xs rounded-full">
          <FontAwesomeIcon icon={faSyncAlt} />
        </button>
      </div>

      <div className="flex flex-col space-y-4 bg-blue-600 rounded-lg">
        {/* Display native token first */}
        {nativeToken && (
          <div>
            <div className="flex items-center px-4">
              <div className="flex items-center justify-center w-12 h-12 bg-white text-black rounded-full">
                {chain?.substring(0, 1)}
              </div>

              <div className="flex flex-col flex-1 ml-4">
                <div className="flex items-center justify-between">
                  <div className="chain-name">{nativeToken.chain}</div>
                  <div className="flex items-center space-x-2 justify-end">
                    {/* Copy Button */}
                    <button className="p-2 bg-transparent text-white">
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                    {/* QR Code Button */}
                    <button className="p-2 bg-transparent text-white">
                      <FontAwesomeIcon icon={faQrcode} />
                    </button>
                    {/* Blockchain Button */}
                    <button className="p-2 bg-transparent text-white">
                      <FontAwesomeIcon icon={faCube} />
                    </button>
                  </div>
                </div>

                <div className="priceInFiat text-left">
                  <strong>{'US$ 0.00'}</strong>
                </div>
                <div className="address mt-2 text-turquoise-600">
                  {nativeToken.address}
                </div>
              </div>
            </div>
            <hr className="w-full border-t border-gray-200 my-4" />
          </div>
        )}

        {/* Display other tokens */}
        {otherTokens.map((coin, index) => (
          <div key={index}>
            <div className="flex items-center px-4">
              <div className="flex items-center justify-center w-9 h-9 bg-white text-black text-xs rounded-full">
                {coin.ticker}
              </div>

              <div className="flex flex-col flex-1 ml-4">
                <div className="flex items-center justify-between">
                  <div className="chain-name">{coin.ticker}</div>
                  <div className="flex items-center space-x-2 justify-end">
                    <div className="priceInFiat text-right">
                      <strong>{'US$ 0.00'}</strong>
                    </div>
                  </div>
                </div>
                <div className="priceInDecimal text-left">
                  {balances.get(coin)?.rawAmount}
                </div>
              </div>
            </div>
            <hr className="w-full border-t border-gray-200 mt-6 mb-4" />
          </div>
        ))}

        {/* Show message if there are no tokens */}
        {otherTokens.length === 0 && !nativeToken && (
          <p>No tokens available for this chain.</p>
        )}
      </div>
    </div>
  );
};

export default VaultItemView;
