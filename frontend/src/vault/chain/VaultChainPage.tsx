import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { AddressPageShyPrompt } from '../../chain/components/address/AddressPageShyPrompt';
import { ChainEntityIcon } from '../../chain/ui/ChainEntityIcon';
import { useCopyAddress } from '../../chain/ui/hooks/useCopyAddress';
import { getChainEntityIconSrc } from '../../chain/utils/getChainEntityIconSrc';
import { isNativeCoin } from '../../chain/utils/isNativeCoin';
import { useAutoDiscoverAndSaveTokens } from '../../coin/query/useAutoDiscoverAndSaveTokens';
import { getBalanceQueryKey } from '../../coin/query/useBalanceQuery';
import { getCoinValue } from '../../coin/utils/getCoinValue';
import { sortCoinsByBalance } from '../../coin/utils/sortCoinsByBalance';
import {
  getStorageCoinKey,
  storageCoinToCoin,
} from '../../coin/utils/storageCoin';
import { useGlobalCurrency } from '../../lib/hooks/useGlobalCurrency';
import { IconButton } from '../../lib/ui/buttons/IconButton';
import { CopyIcon } from '../../lib/ui/icons/CopyIcon';
import { RefreshIcon } from '../../lib/ui/icons/RefreshIcon';
import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { Spinner } from '../../lib/ui/loaders/Spinner';
import { Panel } from '../../lib/ui/panel/Panel';
import { MatchQuery } from '../../lib/ui/query/components/MatchQuery';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { Text } from '../../lib/ui/text';
import { isEmpty } from '../../lib/utils/array/isEmpty';
import { splitBy } from '../../lib/utils/array/splitBy';
import { sum } from '../../lib/utils/array/sum';
import { formatAmount } from '../../lib/utils/formatAmount';
import { makeAppPath } from '../../navigation';
import { TokensStore } from '../../services/Coin/CoinList';
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderIconButton } from '../../ui/page/PageHeaderIconButton';
import { PageHeaderIconButtons } from '../../ui/page/PageHeaderIconButtons';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { BalanceVisibilityAware } from '../balance/visibility/BalanceVisibilityAware';
import { VaultPrimaryActions } from '../components/VaultPrimaryActions';
import { useVaultAddressQuery } from '../queries/useVaultAddressQuery';
import { useVaultChainCoinsQuery } from '../queries/useVaultChainCoinsQuery';
import { useCurrentVaultNativeCoin } from '../state/currentVault';
import { ManageVaultChainCoinsPrompt } from './manage/coin/ManageVaultChainCoinsPrompt';
import { useCurrentVaultChain } from './useCurrentVaultChain';
import { VaultAddressLink } from './VaultAddressLink';
import { VaultChainCoinItem } from './VaultChainCoinItem';

export const VaultChainPage = () => {
  const invalidateQueries = useInvalidateQueries();
  const { globalCurrency } = useGlobalCurrency();
  const chain = useCurrentVaultChain();
  const vaultAddressQuery = useVaultAddressQuery(chain);
  const vaultCoinsQuery = useVaultChainCoinsQuery(chain);
  const nativeCoin = useCurrentVaultNativeCoin(chain);
  const copyAddress = useCopyAddress();
  const storageCoinKey = getStorageCoinKey(nativeCoin);
  const invalidateQueryKey = getBalanceQueryKey(storageCoinKey);
  const { t } = useTranslation();

  const { mutate: refreshBalance, isPending } = useMutation({
    mutationFn: () => {
      return invalidateQueries(invalidateQueryKey);
    },
  });

  const { refetch: retriggerAutoDiscover } = useAutoDiscoverAndSaveTokens({
    chain,
    coin: storageCoinToCoin(nativeCoin),
  });

  const hasMultipleCoinsSupport = !isEmpty(
    TokensStore.TokenSelectionAssets.filter(
      token => token.chain === chain && !token.isNativeToken
    )
  );

  return (
    <VStack flexGrow>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <PageHeaderIconButtons>
            <PageHeaderIconButton
              onClick={() => {
                refreshBalance();
                retriggerAutoDiscover();
              }}
              icon={isPending ? <Spinner /> : <RefreshIcon />}
            />
          </PageHeaderIconButtons>
        }
        title={<PageHeaderTitle>{chain}</PageHeaderTitle>}
      />
      <PageContent gap={16} data-testid="VaultChainPage-Content">
        <VaultPrimaryActions value={getStorageCoinKey(nativeCoin)} />
        <Panel withSections>
          <VStack fullWidth gap={8}>
            <HStack
              fullWidth
              alignItems="center"
              justifyContent="space-between"
            >
              <HStack alignItems="center" gap={12}>
                <ChainEntityIcon
                  value={getChainEntityIconSrc(chain)}
                  style={{ fontSize: 32 }}
                />
                <Text weight="700" color="contrast">
                  {chain}
                </Text>
              </HStack>
              <MatchQuery
                value={vaultAddressQuery}
                success={address => (
                  <HStack>
                    <IconButton
                      onClick={() => copyAddress(address)}
                      title="Copy address"
                      icon={<CopyIcon />}
                    />
                    <AddressPageShyPrompt value={address} />
                    <VaultAddressLink value={address} />
                  </HStack>
                )}
                error={() => null}
                pending={() => null}
              />
            </HStack>
            <MatchQuery
              value={vaultCoinsQuery}
              error={() => t('failed_to_load')}
              pending={() => t('loading')}
              success={coins => {
                const total = sum(
                  coins.map(({ amount, decimals, price = 0 }) =>
                    getCoinValue({
                      amount,
                      decimals,
                      price,
                    })
                  )
                );

                return (
                  <Text
                    size={20}
                    weight="700"
                    color="contrast"
                    centerVertically
                  >
                    <BalanceVisibilityAware>
                      {formatAmount(total, globalCurrency)}
                    </BalanceVisibilityAware>
                  </Text>
                );
              }}
            />
            <MatchQuery
              value={vaultAddressQuery}
              error={() => t('failed_to_load')}
              pending={() => t('loading')}
              success={address => (
                <Text size={14} weight="500" color="primary">
                  <BalanceVisibilityAware size="xxxl">
                    {address}
                  </BalanceVisibilityAware>
                </Text>
              )}
            />
          </VStack>
          <MatchQuery
            value={vaultCoinsQuery}
            error={() => t('failed_to_load')}
            pending={() => t('loading')}
            success={coins => {
              const orderedCoins = splitBy(coins, coin =>
                isNativeCoin(coin) ? 0 : 1
              )
                .map(sortCoinsByBalance)
                .flat();

              return (
                <>
                  {orderedCoins.map(coin => (
                    <Link
                      key={coin.id}
                      to={makeAppPath('vaultChainCoinDetail', {
                        chain: chain,
                        coin: coin.id,
                      })}
                    >
                      <VaultChainCoinItem value={coin} />
                    </Link>
                  ))}
                </>
              );
            }}
          />
        </Panel>
        {hasMultipleCoinsSupport && (
          <ManageVaultChainCoinsPrompt value={chain} />
        )}
      </PageContent>
    </VStack>
  );
};
