import styled from 'styled-components';

import { ChainEntityIcon } from '../../chain/ui/ChainEntityIcon';
import { fromChainAmount } from '../../chain/utils/fromChainAmount';
import { getChainEntityIconSrc } from '../../chain/utils/getChainEntityIconSrc';
import { getCoinValue } from '../../coin/utils/getCoinValue';
import { useGlobalCurrency } from '../../lib/hooks/useGlobalCurrency';
import { centerContent } from '../../lib/ui/css/centerContent';
import { horizontalPadding } from '../../lib/ui/css/horizontalPadding';
import { round } from '../../lib/ui/css/round';
import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { Panel } from '../../lib/ui/panel/Panel';
import { Text } from '../../lib/ui/text';
import { getColor } from '../../lib/ui/theme/getters';
import { sum } from '@lib/utils/array/sum';
import { formatAmount } from '@lib/utils/formatAmount';
import { BalanceVisibilityAware } from '../balance/visibility/BalanceVisibilityAware';
import { VaultChainBalance } from '../queries/useVaultChainsBalancesQuery';
import { useCurrentVaultAddreses } from '../state/currentVault';
import { useHandleVaultChainItemPress } from './useHandleVaultChainItemPress';

const Pill = styled.div`
  height: 24px;
  ${round};
  ${horizontalPadding(12)};
  font-size: 12px;
  ${centerContent};
  background: ${getColor('mist')};
`;

type VaultChainItemProps = {
  vault: VaultChainBalance;
};

export const VaultChainItem = ({ vault }: VaultChainItemProps) => {
  const { chain, coins } = vault;
  const { globalCurrency } = useGlobalCurrency();

  const addresses = useCurrentVaultAddreses();
  const address = addresses[chain];

  const pressHandlers = useHandleVaultChainItemPress({
    chain,
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
    <Panel data-testid="VaultChainItem-Panel" {...pressHandlers}>
      <HStack fullWidth alignItems="center" gap={16}>
        <ChainEntityIcon
          value={getChainEntityIconSrc(chain)}
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
              {chain}
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
                <BalanceVisibilityAware>
                  {formatAmount(totalAmount, globalCurrency)}
                </BalanceVisibilityAware>
              </Text>
            </HStack>
          </HStack>
          <Text color="primary" weight="400" size={12}>
            <BalanceVisibilityAware size="xxxl">
              {address}
            </BalanceVisibilityAware>
          </Text>
        </VStack>
      </HStack>
    </Panel>
  );
};
