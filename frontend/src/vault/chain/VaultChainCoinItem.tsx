import { EntityWithPrice } from '../../chain/EntityWithPrice';
import { ChainCoinIcon } from '../../chain/ui/ChainCoinIcon';
import { fromChainAmount } from '../../chain/utils/fromChainAmount';
import { getChainEntityIconSrc } from '../../chain/utils/getChainEntityIconSrc';
import { isNativeCoin } from '../../chain/utils/isNativeCoin';
import { CoinAmount, CoinInfo, CoinKey } from '../../coin/Coin';
import { useGlobalCurrency } from '../../lib/hooks/useGlobalCurrency';
import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { ComponentWithValueProps } from '../../lib/ui/props';
import { Text } from '../../lib/ui/text';
import { formatAmount } from '../../lib/utils/formatAmount';
import { BalanceVisibilityAware } from '../balance/visibility/BalanceVisibilityAware';

export const VaultChainCoinItem = ({
  value,
}: ComponentWithValueProps<
  CoinInfo & CoinAmount & Partial<EntityWithPrice> & CoinKey
>) => {
  const { icon, symbol, amount, decimals, price, id, chainId } = value;
  const { globalCurrencySymbol } = useGlobalCurrency();
  const balance = fromChainAmount(amount, decimals);

  return (
    <HStack fullWidth alignItems="center" gap={12}>
      <ChainCoinIcon
        coinSrc={icon}
        chainSrc={
          isNativeCoin({ id, chainId })
            ? undefined
            : getChainEntityIconSrc(chainId)
        }
        style={{ fontSize: 32 }}
      />
      <VStack fullWidth gap={8}>
        <HStack fullWidth justifyContent="space-between" alignItems="center">
          <Text color="contrast" size={20} weight="500">
            {symbol}
          </Text>
          <Text color="contrast" size={18} weight="700" centerVertically>
            {globalCurrencySymbol}
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
