/* eslint-disable */
import React, { useMemo } from 'react';
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
import { PageContent } from '../../ui/page/PageContent';
import { VaultPrimaryActions } from './VaultPrimaryActions';
import { VaultTotalBalance } from './VaultTotalBalance';
import { sum } from '../../lib/utils/array/sum';
import { fromChainAmount } from '../../chain/utils/fromChainAmount';
import { getChainEntityIconPath } from '../../chain/utils/getChainEntityIconPath';

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

  const coin = useMemo(() => {
    return (
      Array.from(coins.values())
        .flat()
        .find(coin => coin.chain === Chain.THORChain && coin.isNativeToken) ||
      null
    );
  }, [coins]);

  const coinBalances = useMemo(() => {
    if (!coin) return new Map<Coin, Balance>();
    return new Map(
      Array.from(balances.entries()).filter(
        ([coin]) => coin.chain === Chain.THORChain && coin.isNativeToken
      )
    );
  }, [balances, coin]);

  const coinPriceRates = useMemo(() => {
    if (!coin) return new Map<string, Rate[]>();
    const coinMeta = CoinMeta.fromCoin(coin);
    return new Map(
      Array.from(priceRates.entries()).filter(
        ([key]) => key === CoinMeta.sortedStringify(coinMeta)
      )
    );
  }, [priceRates, coin]);

  const totalBalance = useMemo(() => {
    const items = Array.from(coins.values()).flat();
    //.filter(f => f.isNativeToken);

    const total = sum(
      items.map(coin => {
        const coinMeta = CoinMeta.fromCoin(coin);
        const fiatPrice = priceRates
          .get(CoinMeta.sortedStringify(coinMeta))
          ?.find(rate => rate.fiat === Fiat.USD)?.value;

        if (!fiatPrice) {
          return 0;
        }

        const amount = balances.get(coin)?.rawAmount || 0;
        if (!amount) {
          return 0;
        }

        return fromChainAmount(amount, coin.decimals) * fiatPrice;
      })
    );

    return total;
  }, [coins, balances, priceRates]);

  return (
    <ScrollableFlexboxFiller>
      <PageContent>
        <VStack gap={32}>
          <VStack gap={24} alignItems="center">
            <VaultTotalBalance value={totalBalance} />
            {coin && (
              <VaultPrimaryActions
                coin={coin}
                balances={coinBalances}
                priceRates={coinPriceRates}
              />
            )}
          </VStack>
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
                        const icon = getChainEntityIconPath(coin.logo);
                        const coinMeta = CoinMeta.fromCoin(coin);
                        const fiatPrice = priceRates
                          .get(CoinMeta.sortedStringify(coinMeta))
                          ?.find(rate => rate.fiat === Fiat.USD)?.value;

                        return (
                          <CoinBalanceItem
                            key={index}
                            name={coin.chain}
                            address={coin.address}
                            amount={amount}
                            decimals={coin.decimals}
                            icon={icon}
                            fiatPrice={fiatPrice}
                            onClick={() => {
                              navigate(`/vault/item/detail/${chain}`, {
                                state: {
                                  coins: Array.from(coins.entries()).filter(
                                    f => f[0] === chain
                                  ),
                                  balances: balances,
                                  priceRates: priceRates,
                                },
                              });

                              // navigate(`/vault/item/send/${chain}`, {
                              //   state: {
                              //     coin: coin,
                              //     balances: balances,
                              //     priceRates: priceRates,
                              //   },
                              // });
                            }}
                          />
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </VStack>
          )}
        </VStack>
      </PageContent>
    </ScrollableFlexboxFiller>
  );
};
