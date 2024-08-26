/* eslint-disable */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chain } from '../../model/chain';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Balance } from '../../model/balance';
import { ScrollableFlexboxFiller } from '../../lib/ui/layout/ScrollableFlexboxFiller';
import { CoinBalanceItem } from '../../coin/components/CoinBalanceItem';
import { VStack } from '../../lib/ui/layout/Stack';
import { CoinMeta } from '../../model/coin-meta';
import { Rate } from '../../model/price-rate';
import { Fiat } from '../../model/fiat';

type VaultBalancesProps = {
  coins: Map<Chain, Coin[]>;
  balances: Map<Coin, Balance>;
  priceRates: Map<string, Rate[]>;
};

export const VaultBalances: React.FC<VaultBalancesProps> = ({
  coins,
  balances,
  priceRates,
}: VaultBalancesProps) => {
  const navigate = useNavigate();

  function getPriceInFiat(coin: CoinMeta, amount: number, fiat: Fiat): number {
    const rate = priceRates
      .get(CoinMeta.sortedStringify(coin))
      ?.find(rate => rate.fiat === fiat);
    console.log(rate);
    if (rate) {
      const amountInDecimal = amount / Math.pow(10, coin.decimals);
      const convertedAmount = rate.value * amountInDecimal;
      // round it to 2 decimal places, fiat value is in USD
      // right now it has 18 decimal places
      return Math.round((convertedAmount + Number.EPSILON) * 100) / 100;
    }
    return -1;
  }

  return (
    <ScrollableFlexboxFiller>
      <div className="text-white px-4 py-4">
        {coins.size === 0 ? (
          <p>No coins available for this vault.</p>
        ) : (
          <VStack gap={16}>
            {Array.from(coins.entries()).map(([chain, coinArray]) => {
              return (
                <React.Fragment key={chain}>
                  {coinArray
                    .filter(f => f.isNativeToken)
                    .map((coin, index) => {
                      const balance = balances.get(coin);
                      const amount = balance?.rawAmount || 0;
                      const icon = `/assets/icons/coins/${coin.logo}.svg`;
                      const coinMeta = CoinMeta.fromCoin(coin);

                      // Calculate the fiat value for the coin
                      // TODO: We must get the fiat from the settings in the future
                      const fiatValue = balance
                        ? getPriceInFiat(coinMeta, amount, Fiat.USD)
                        : -1;

                      console.log(fiatValue);

                      return (
                        <CoinBalanceItem
                          key={index}
                          name={coin.chain}
                          address={coin.address}
                          amount={amount}
                          decimals={coin.decimals}
                          chainId={coin.priceProviderId}
                          icon={icon}
                          fiatValue={fiatValue}
                          onClick={() => {
                            navigate(`/vault/item/detail/${chain}`, {
                              state: { coins: coinArray, balances },
                            });
                          }}
                        />
                      );
                    })}
                </React.Fragment>
              );
            })}
          </VStack>
        )}
      </div>
    </ScrollableFlexboxFiller>
  );
};
