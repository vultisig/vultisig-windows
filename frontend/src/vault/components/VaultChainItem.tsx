import styled from 'styled-components';

import { ChainEntityIcon } from '../../chain/ui/ChainEntityIcon';
import { fromChainAmount } from '../../chain/utils/fromChainAmount';
import { getChainEntityIconSrc } from '../../chain/utils/getChainEntityIconSrc';
import { centerContent } from '../../lib/ui/css/centerContent';
import { horizontalPadding } from '../../lib/ui/css/horizontalPadding';
import { round } from '../../lib/ui/css/round';
import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { Panel } from '../../lib/ui/panel/Panel';
import { ComponentWithValueProps } from '../../lib/ui/props';
import { QueryDependant } from '../../lib/ui/query/components/QueryDependant';
import { getQueryDependantDefaultProps } from '../../lib/ui/query/utils/getQueryDependantDefaultProps';
import { Text } from '../../lib/ui/text';
import { getColor } from '../../lib/ui/theme/getters';
import { sum } from '../../lib/utils/array/sum';
import { formatAmount } from '../../lib/utils/formatAmount';
import { Chain } from '../../model/chain';
import { BalanceVisibilityAware } from '../balance/visibility/BalanceVisibilityAware';
import { useVaultAddressQuery } from '../queries/useVaultAddressQuery';
import { useVaultChainCoinsQuery } from '../queries/useVaultChainCoinsQuery';
import { useHandleVaultChainItemPress } from './useHandleVaultChainItemPress';

const Pill = styled.div`
  height: 24px;
  ${round};
  ${horizontalPadding(12)};
  font-size: 12px;
  ${centerContent};
  background: ${getColor('mist')};
`;

export const VaultChainItem = ({ value }: ComponentWithValueProps<string>) => {
  const coinsQuery = useVaultChainCoinsQuery(value as Chain);

  const vaultAddressQuery = useVaultAddressQuery(value as Chain);

  const pressHandlers = useHandleVaultChainItemPress({
    chainId: value,
    address: vaultAddressQuery.data,
  });

  return (
    <Panel {...pressHandlers}>
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
                <ChainEntityIcon
                  value={getChainEntityIconSrc(value)}
                  style={{ fontSize: 32 }}
                />

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
                        <Text
                          color="contrast"
                          weight="400"
                          size={12}
                          centerVertically
                        >
                          <BalanceVisibilityAware>
                            {formatAmount(
                              fromChainAmount(
                                singleCoin.amount,
                                singleCoin.decimals
                              )
                            )}
                          </BalanceVisibilityAware>
                        </Text>
                      ) : coins.length > 1 ? (
                        <Pill>
                          <BalanceVisibilityAware>
                            {coins.length} assets
                          </BalanceVisibilityAware>
                        </Pill>
                      ) : null}
                      <Text
                        centerVertically
                        color="contrast"
                        weight="700"
                        size={16}
                      >
                        $
                        <BalanceVisibilityAware>
                          {formatAmount(totalAmount)}
                        </BalanceVisibilityAware>
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
  );
};
