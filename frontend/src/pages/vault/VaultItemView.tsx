/* eslint-disable */
import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
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
import { Rate } from '../../model/price-rate';
import { CoinMeta } from '../../model/coin-meta';
import { Fiat } from '../../model/fiat';

const VaultItemView: React.FC = () => {
  const navigate = useNavigate();
  const { chain } = useParams<{ chain: string }>();
  const location = useLocation();
  const { coins, balances, priceRates } = location.state as {
    coins: Coin[];
    balances: Map<Coin, Balance>;
    priceRates: Map<string, Rate[]>;
  };

  function getPriceInFiat(coin: CoinMeta, amount: number, fiat: Fiat): number {
    const rate = priceRates
      .get(CoinMeta.sortedStringify(coin))
      ?.find(rate => rate.fiat === fiat);

    if (rate) {
      const amountInDecimal = amount / Math.pow(10, coin.decimals);
      const convertedAmount = rate.value * amountInDecimal;
      return Math.round((convertedAmount + Number.EPSILON) * 100) / 100;
    }
    return 0;
  }

  function getTotalFiatValue(coins: Coin[], fiat: Fiat): number {
    let totalFiatValue = 0;

    // Calculate the fiat value for each coin and sum them up
    coins.forEach(coin => {
      const balance = balances.get(coin);
      if (balance) {
        const coinMeta = CoinMeta.fromCoin(coin);
        const fiatValue = getPriceInFiat(coinMeta, balance.rawAmount, fiat);
        if (fiatValue > 0) {
          totalFiatValue += fiatValue;
        }
      }
    });

    return totalFiatValue;
  }

  // Separate native token and other tokens
  const nativeToken = coins.find(coin => coin.isNativeToken);
  const otherTokens = coins.filter(coin => !coin.isNativeToken);

  const handleChainClick = (
    chain: string,
    coin: Coin,
    balances: Map<Coin, Balance>
  ) => {
    navigate(`/vault/item/send/${chain}`, {
      state: { coin: coin, balances, priceRates },
    });
  };

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
        {nativeToken &&
          (() => {
            const icon = `/assets/icons/coins/${nativeToken.logo}.svg`;
            // Calculate the fiat value for the individual coin
            const totalFiatValue = getTotalFiatValue(coins, Fiat.USD);
            return (
              <div>
                <div className="flex items-center px-4">
                  <div
                    className="flex items-center justify-center w-9 h-9 text-black text-xs rounded-full"
                    style={{
                      backgroundImage: `url(${icon})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    {/* Optionally keep the ticker as a fallback or overlay */}
                    {/* <span className="sr-only">{coin.ticker}</span> */}
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
                      <strong>{totalFiatValue}</strong>
                    </div>
                    <div className="address mt-2 text-turquoise-600">
                      {nativeToken.address}
                    </div>
                  </div>
                </div>
                <hr className="w-full border-t border-gray-200 my-4" />
              </div>
            );
          })()}

        {/* Display native token */}
        {nativeToken &&
          (() => {
            const balance = balances.get(nativeToken);
            const amount = balance?.rawAmount || 0;
            const icon = `/assets/icons/coins/${nativeToken.logo}.svg`;
            const coinMeta = CoinMeta.fromCoin(nativeToken);
            // Calculate the fiat value for the individual coin
            const fiatValue = getPriceInFiat(coinMeta, amount, Fiat.USD);

            return (
              <div
                onClick={() =>
                  handleChainClick(chain ?? '', nativeToken, balances)
                }
              >
                <div className="flex items-center px-4">
                  <div
                    className="flex items-center justify-center w-9 h-9 text-black text-xs rounded-full"
                    style={{
                      backgroundImage: `url(${icon})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    {/* Optionally keep the ticker as a fallback or overlay */}
                    {/* <span className="sr-only">{coin.ticker}</span> */}
                  </div>

                  <div className="flex flex-col flex-1 ml-4">
                    <div className="flex items-center justify-between">
                      <div className="chain-name">{nativeToken.ticker}</div>
                      <div className="flex items-center space-x-2 justify-end">
                        <div className="priceInFiat text-right">
                          <strong>{`US$ ${fiatValue.toFixed(2)}`}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="priceInDecimal text-left">
                      {balance?.decimalAmount}
                    </div>
                  </div>
                </div>
                <hr className="w-full border-t border-gray-200 mt-6 mb-4" />
              </div>
            );
          })()}

        {/* Display other tokens */}
        {otherTokens.map((coin, index) => {
          const balance = balances.get(coin);
          const amount = balance?.rawAmount || 0;
          const icon = `/assets/icons/coins/${coin.logo}.svg`;

          const coinMeta = CoinMeta.fromCoin(coin);
          // Calculate the fiat value for the individual coin
          const fiatValue = getPriceInFiat(coinMeta, amount, Fiat.USD);

          return (
            <div
              key={index}
              onClick={() => handleChainClick(chain ?? '', coin, balances)}
            >
              <div className="flex items-center px-4">
                <div
                  className="flex items-center justify-center w-9 h-9 text-black text-xs rounded-full"
                  style={{
                    backgroundImage: `url(${icon})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  {/* Optionally keep the ticker as a fallback or overlay */}
                  {/* <span className="sr-only">{coin.ticker}</span> */}
                </div>

                <div className="flex flex-col flex-1 ml-4">
                  <div className="flex items-center justify-between">
                    <div className="chain-name">{coin.ticker}</div>
                    <div className="flex items-center space-x-2 justify-end">
                      <div className="priceInFiat text-right">
                        <strong>{fiatValue}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="priceInDecimal text-left">
                    {balances.get(coin)?.decimalAmount}
                  </div>
                </div>
              </div>
              <hr className="w-full border-t border-gray-200 mt-6 mb-4" />
            </div>
          );
        })}

        {/* Show message if there are no tokens */}
        {otherTokens.length === 0 && !nativeToken && (
          <p>No tokens available for this chain.</p>
        )}
      </div>
    </div>
  );
};

export default VaultItemView;
