import { Link } from 'react-router-dom';
import { ComponentWithValueProps } from '../../lib/ui/props';
import { Panel } from '../../lib/ui/panel/Panel';
import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { ChainEntityIcon } from '../../chain/ui/ChainEntityIcon';
import { getChainEntityIconSrc } from '../../chain/utils/getChainEntityIconSrc';
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
import { useVaultChainCoinsQuery } from '../queries/useVaultChainCoinsQuery';

const Pill = styled.div`
  height: 24px;
  ${round};
  ${horizontalPadding(12)};
  font-size: 12px;
  ${centerContent};
`;

export const VaultChainItem = ({ value }: ComponentWithValueProps<string>) => {
  const coinsQuery = useVaultChainCoinsQuery(value as Chain);

  const vaultAddressQuery = useVaultAddressQuery(value as Chain);

  return (
    <Link to={`/vault/item/detail/${value}`}>
      <Panel>
        <HStack fullWidth alignItems="center" gap={16}>
          <QueryDependant
            query={coinsQuery}
            {...getQueryDependantDefaultProps(`${value} balances`)}
            success={coins => {
              const singleCoin = coins.length === 1 ? coins[0] : null;

              const totalAmount = sum(
                coins.map(
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
                      coinSrc={singleCoin.icon}
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
                        ) : coins.length > 1 ? (
                          <Pill>{coins.length} assets</Pill>
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
