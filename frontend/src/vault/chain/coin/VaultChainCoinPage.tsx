import { useMemo } from 'react';

import { areEqualCoins } from '../../../coin/Coin';
import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { useCoinPricesQuery } from '../../../coin/query/useCoinPricesQuery';
import { getCoinKey } from '../../../coin/utils/coin';
import { getCoinMetaIconSrc } from '../../../coin/utils/coinMeta';
import {
  getStorageCoinKey,
  storageCoinToCoin,
} from '../../../coin/utils/storageCoin';
import { RefreshIcon } from '../../../lib/ui/icons/RefreshIcon';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Panel } from '../../../lib/ui/panel/Panel';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { getQueryDependantDefaultProps } from '../../../lib/ui/query/utils/getQueryDependantDefaultProps';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { CoinMeta } from '../../../model/coin-meta';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderIconButton } from '../../../ui/page/PageHeaderIconButton';
import { PageHeaderIconButtons } from '../../../ui/page/PageHeaderIconButtons';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { VaultPrimaryActions } from '../../components/VaultPrimaryActions';
import { useCurrentVaultCoins } from '../../state/currentVault';
import { VaultChainCoinItem } from '../VaultChainCoinItem';
import { useCurrentVaultCoinKey } from './useCurrentVaultCoinKey';

export const VaultChainCoinPage = () => {
  const coinKey = useCurrentVaultCoinKey();

  const coins = useCurrentVaultCoins();

  const coin = useMemo(() => {
    return storageCoinToCoin(
      shouldBePresent(
        coins.find(coin => areEqualCoins(getStorageCoinKey(coin), coinKey))
      )
    );
  }, [coins, coinKey]);

  const balanceQuery = useBalanceQuery(coin);

  const pricesQuery = useCoinPricesQuery([CoinMeta.fromCoin(coin)]);

  return (
    <VStack flexGrow data-testid="ManageVaultChainCoinPage-Coin">
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <PageHeaderIconButtons>
            <PageHeaderIconButton icon={<RefreshIcon />} />
          </PageHeaderIconButtons>
        }
        title={<PageHeaderTitle>{coin.ticker}</PageHeaderTitle>}
      />
      <PageContent gap={16}>
        <VaultPrimaryActions value={getCoinKey(coin)} />
        <Panel>
          <QueryDependant
            query={balanceQuery}
            {...getQueryDependantDefaultProps('balance')}
            success={({ amount, decimals }) => {
              const price = pricesQuery.data
                ? pricesQuery.data[0]?.price
                : undefined;
              return (
                <VaultChainCoinItem
                  value={{
                    amount,
                    decimals,
                    icon: getCoinMetaIconSrc(coin),
                    symbol: coin.ticker,
                    price,
                    ...coinKey,
                  }}
                />
              );
            }}
          />
        </Panel>
      </PageContent>
    </VStack>
  );
};
