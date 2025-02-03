import { EntityWithPrice } from '../../chain/EntityWithPrice';
import { ChainCoinIcon } from '../../chain/ui/ChainCoinIcon';
import { fromChainAmount } from '../../chain/utils/fromChainAmount';
import { getChainEntityIconSrc } from '../../chain/utils/getChainEntityIconSrc';
import { isNativeCoin } from '../../chain/utils/isNativeCoin';
import { CoinAmount, CoinKey } from '../../coin/Coin';
import { getCoinMetaIconSrc } from '../../coin/utils/coinMeta';
import { useGlobalCurrency } from '../../lib/hooks/useGlobalCurrency';
import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { ValueProp } from '../../lib/ui/props';
import { Text } from '../../lib/ui/text';
import { EntityWithLogo } from '@lib/utils/entities/EntityWithLogo';
import { EntityWithTicker } from '@lib/utils/entities/EntityWithTicker';
import { formatAmount } from '@lib/utils/formatAmount';
import { BalanceVisibilityAware } from '../balance/visibility/BalanceVisibilityAware';
import { shouldDisplayChainLogo } from './utils';

export const VaultChainCoinItem = ({
  value,
}: ValueProp<
  EntityWithLogo &
    EntityWithTicker &
    CoinAmount &
    Partial<EntityWithPrice> &
    CoinKey
>) => {
  const { logo, ticker, amount, decimals, price, id, chain } = value;
  const { globalCurrency } = useGlobalCurrency();
  const balance = fromChainAmount(amount, decimals);

  return (
    <HStack fullWidth alignItems="center" gap={12}>
      <ChainCoinIcon
        coinSrc={getCoinMetaIconSrc({
          logo,
        })}
        chainSrc={
          shouldDisplayChainLogo({
            ticker,
            chain,
            isNative: isNativeCoin({ id, chain }),
          })
            ? getChainEntityIconSrc(chain)
            : undefined
        }
        style={{ fontSize: 32 }}
      />
      <VStack fullWidth gap={8}>
        <HStack fullWidth justifyContent="space-between" alignItems="center">
          <Text color="contrast" size={20} weight="500">
            {ticker}
          </Text>
          <Text color="contrast" size={18} weight="700" centerVertically>
            <BalanceVisibilityAware>
              {formatAmount(balance * (price || 0), globalCurrency)}
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
