import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Chain } from '../../model/chain';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Balance } from '../../model/balance';
import { ScrollableFlexboxFiller } from '../../lib/ui/layout/ScrollableFlexboxFiller';
import { CoinBalanceItem } from '../../coin/components/CoinBalanceItem';
import { VStack } from '../../lib/ui/layout/Stack';

type VaultBalancesProps = {
  coins: Map<Chain, Coin[]>;
  balances: Map<Coin, Balance>;
};

export const VaultBalances: React.FC<VaultBalancesProps> = ({
  coins,
  balances,
}: VaultBalancesProps) => {
  const navigate = useNavigate();

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

                      return (
                        <CoinBalanceItem
                          key={index}
                          name={coin.ticker}
                          address={coin.address}
                          amount={amount}
                          decimals={coin.decimals}
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
