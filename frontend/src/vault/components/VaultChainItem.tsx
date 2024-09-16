import { ComponentWithValueProps } from '../../lib/ui/props';
import { Panel } from '../../lib/ui/panel/Panel';
import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { ChainEntityIcon } from '../../chain/ui/ChainEntityIcon';
import { getChainEntityIconSrc } from '../../chain/utils/getChainEntityIconSrc';
import { Text } from '../../lib/ui/text';
import { fromChainAmount } from '../../chain/utils/fromChainAmount';
import { formatAmount } from '../../lib/utils/formatAmount';
import { sum } from '../../lib/utils/array/sum';
import styled from 'styled-components';
import { round } from '../../lib/ui/css/round';
import { horizontalPadding } from '../../lib/ui/css/horizontalPadding';
import { centerContent } from '../../lib/ui/css/centerContent';
import { getColor } from '../../lib/ui/theme/getters';
import { BalanceVisibilityAware } from '../balance/visibility/BalanceVisibilityAware';
import { useHandleVaultChainItemPress } from './useHandleVaultChainItemPress';
import { VaultChainBalance } from '../queries/useVaultChainsBalancesQuery';
import { useAssertCurrentVaultAddreses } from '../state/useCurrentVault';
import { getCoinValue } from '../../coin/utils/getCoinValue';

const Pill = styled.div`
  height: 24px;
  ${round};
  ${horizontalPadding(12)};
  font-size: 12px;
  ${centerContent};
  background: ${getColor('mist')};
`;

export const VaultChainItem = ({
  value,
}: ComponentWithValueProps<VaultChainBalance>) => {
  const { chainId, coins } = value;

  const addresses = useAssertCurrentVaultAddreses();
  const address = addresses[chainId];

  const pressHandlers = useHandleVaultChainItemPress({
    chainId,
    address,
  });

  const singleCoin = coins.length === 1 ? coins[0] : null;

  const totalAmount = sum(
    coins.map(coin =>
      getCoinValue({
        price: coin.price ?? 0,
        amount: coin.amount,
        decimals: coin.decimals,
      })
    )
  );

  return (
    <Panel {...pressHandlers}>
      <HStack fullWidth alignItems="center" gap={16}>
        <ChainEntityIcon
          value={getChainEntityIconSrc(chainId)}
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
              {chainId}
            </Text>
            <HStack alignItems="center" gap={12}>
              {singleCoin ? (
                <Text color="contrast" weight="400" size={12} centerVertically>
                  <BalanceVisibilityAware>
                    {formatAmount(
                      fromChainAmount(singleCoin.amount, singleCoin.decimals)
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
              <Text centerVertically color="contrast" weight="700" size={16}>
                $
                <BalanceVisibilityAware>
                  {formatAmount(totalAmount)}
                </BalanceVisibilityAware>
              </Text>
            </HStack>
          </HStack>
          <Text color="primary" weight="400" size={12}>
            {address}
          </Text>
        </VStack>
      </HStack>
    </Panel>
  );
};
