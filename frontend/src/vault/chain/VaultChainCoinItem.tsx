import { EntityWithPrice } from '../../chain/EntityWithPrice';
import { ChainEntityIcon } from '../../chain/ui/ChainEntityIcon';
import { fromChainAmount } from '../../chain/utils/fromChainAmount';
import { CoinAmount, CoinInfo } from '../../coin/Coin';
import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { ComponentWithValueProps } from '../../lib/ui/props';
import { Text } from '../../lib/ui/text';
import { formatAmount } from '../../lib/utils/formatAmount';
import { BalanceVisibilityAware } from '../balance/visibility/BalanceVisibilityAware';

export const VaultChainCoinItem = ({
  value,
}: ComponentWithValueProps<
  CoinInfo & CoinAmount & Partial<EntityWithPrice>
>) => {
  const { icon, symbol, amount, decimals, price } = value;

  const balance = fromChainAmount(amount, decimals);

  return (
    <HStack fullWidth alignItems="center" gap={12}>
      <ChainEntityIcon value={icon} style={{ fontSize: 32 }} />
      <VStack fullWidth gap={8}>
        <HStack fullWidth justifyContent="space-between" alignItems="center">
          <Text color="contrast" size={20} weight="500">
            {symbol}
          </Text>
          <Text color="contrast" size={18} weight="700" centerVertically>
            $
            <BalanceVisibilityAware>
              {formatAmount(balance * (price || 0))}
            </BalanceVisibilityAware>
          </Text>
        </HStack>
        <Text color="contrast" size={18} weight="500" centerVertically>
          <BalanceVisibilityAware>
            {formatAmount(balance)}
          </BalanceVisibilityAware>
        </Text>
      </VStack>
    </HStack>
  );
};
