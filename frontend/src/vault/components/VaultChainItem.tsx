import { Link } from 'react-router-dom';
import { ComponentWithValueProps } from '../../lib/ui/props';
import { useAsserCurrentVaultChainCoins } from '../state/useCurrentVault';
import { Panel } from '../../lib/ui/panel/Panel';
import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { ChainEntityIcon } from '../../chain/ui/ChainEntityIcon';
import { storageCoinToCoin } from '../../coin/utils/storageCoin';
import { getChainEntityIconSrc } from '../../chain/utils/getChainEntityIconSrc';
import { useOwnedCoinsQuery } from '../../coin/query/useOwnedCoinsQuery';
import { QueryDependant } from '../../lib/ui/query/components/QueryDependant';
import { getQueryDependantDefaultProps } from '../../lib/ui/query/utils/getQueryDependantDefaultProps';
import { useVaultAddressQuery } from '../queries/useVaultAddressQuery';
import { Chain } from '../../model/chain';
import { Text } from '../../lib/ui/text';
import { fromChainAmount } from '../../chain/utils/fromChainAmount';
import { formatAmount } from '../../lib/utils/formatAmount';
import { ChainCoinIcon } from '../../chain/ui/ChainCoinIcon';
import { sum } from '../../lib/utils/array/sum';
import styled from 'styled-components';
import { round } from '../../lib/ui/css/round';
import { horizontalPadding } from '../../lib/ui/css/horizontalPadding';
import { centerContent } from '../../lib/ui/css/centerContent';
import { getCoinMetaIconSrc, getCoinMetaKey } from '../../coin/utils/coinMeta';
import { areEqualCoins } from '../../coin/Coin';
import { shouldBePresent } from '../../lib/utils/assert/shouldBePresent';

const Pill = styled.div`
  height: 24px;
  ${round};
  ${horizontalPadding(12)};
  font-size: 12px;
  ${centerContent};
`;

export const VaultChainItem = ({ value }: ComponentWithValueProps<string>) => {
  const coins = useAsserCurrentVaultChainCoins(value);

  const ownedCoinsQuery = useOwnedCoinsQuery(coins.map(storageCoinToCoin));

  const vaultAddressQuery = useVaultAddressQuery(value as Chain);

  return (
    <Link to={`/vault/item/detail/${value}`}>
      <Panel>
        <HStack fullWidth alignItems="center" gap={16}>
          <QueryDependant
            query={ownedCoinsQuery}
            {...getQueryDependantDefaultProps(`${value} balances`)}
            success={ownedCoins => {
              const singleCoin = ownedCoins.length === 1 ? ownedCoins[0] : null;

              const totalAmount = sum(
                ownedCoins.map(
                  coin =>
                    (coin.price ?? 0) *
                    fromChainAmount(coin.amount, coin.decimals)
                )
              );
              return (
                <>
                  {singleCoin ? (
                    <ChainCoinIcon
                      style={{ fontSize: 32 }}
                      chainSrc={getChainEntityIconSrc(value)}
                      coinSrc={getCoinMetaIconSrc(
                        shouldBePresent(
                          coins.find(coin =>
                            areEqualCoins(
                              singleCoin,
                              getCoinMetaKey({
                                ...storageCoinToCoin(coin),
                                chain: value as Chain,
                              })
                            )
                          )
                        )
                      )}
                    />
                  ) : (
                    <ChainEntityIcon
                      value={getChainEntityIconSrc(value)}
                      style={{ fontSize: 32 }}
                    />
                  )}

                  <VStack fullWidth alignItems="start" gap={12}>
                    <HStack
                      fullWidth
                      alignItems="center"
                      justifyContent="space-between"
                      gap={20}
                    >
                      <Text color="contrast" weight="700" size={16}>
                        {value}
                      </Text>
                      <HStack alignItems="center" gap={12}>
                        {singleCoin ? (
                          <Text color="contrast" weight="400" size={12}>
                            {formatAmount(
                              fromChainAmount(
                                singleCoin.amount,
                                singleCoin.decimals
                              )
                            )}
                          </Text>
                        ) : ownedCoins.length > 1 ? (
                          <Pill>{ownedCoins.length} assets</Pill>
                        ) : null}
                        <Text color="contrast" weight="700" size={16}>
                          ${formatAmount(totalAmount)}
                        </Text>
                      </HStack>
                    </HStack>
                    <QueryDependant
                      query={vaultAddressQuery}
                      {...getQueryDependantDefaultProps('vault address')}
                      success={address => (
                        <Text color="primary" weight="400" size={12}>
                          {address}
                        </Text>
                      )}
                    />
                  </VStack>
                </>
              );
            }}
          />
        </HStack>
      </Panel>
    </Link>
  );
};
