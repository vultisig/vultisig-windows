import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { areEqualCoins } from '../../../coin/Coin';
import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { useCoinPricesQuery } from '../../../coin/query/useCoinPricesQuery';
import { getCoinKey } from '../../../coin/utils/coin';
import {
  getStorageCoinKey,
  storageCoinToCoin,
} from '../../../coin/utils/storageCoin';
import { RefreshIcon } from '../../../lib/ui/icons/RefreshIcon';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Spinner } from '../../../lib/ui/loaders/Spinner';
import { Panel } from '../../../lib/ui/panel/Panel';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
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
  const { refetch, isFetching } = balanceQuery;

  const pricesQuery = useCoinPricesQuery([CoinMeta.fromCoin(coin)]);

  const { t } = useTranslation();

  return (
    <VStack flexGrow data-testid="ManageVaultChainCoinPage-Coin">
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <PageHeaderIconButtons>
            <PageHeaderIconButton
              onClick={() => refetch()}
              icon={isFetching ? <Spinner /> : <RefreshIcon />}
            />
          </PageHeaderIconButtons>
        }
        title={<PageHeaderTitle>{coin.ticker}</PageHeaderTitle>}
      />
      <PageContent gap={16}>
        <VaultPrimaryActions value={getCoinKey(coin)} />
        <Panel>
          <MatchQuery
            value={balanceQuery}
            error={() => t('failed_to_load')}
            pending={() => t('loading')}
            success={({ amount, decimals }) => {
              const price = pricesQuery.data
                ? pricesQuery.data[0]?.price
                : undefined;
              return (
                <VaultChainCoinItem
                  value={{
                    amount,
                    decimals,
                    logo: coin.logo,
                    ticker: coin.ticker,
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
