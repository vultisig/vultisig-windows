import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { storage } from '../../../wailsjs/go/models';
import { AddressPageShyPrompt } from '../../chain/components/address/AddressPageShyPrompt';
import { ChainEntityIcon } from '../../chain/ui/ChainEntityIcon';
import { useCopyAddress } from '../../chain/ui/hooks/useCopyAddress';
import { getChainEntityIconSrc } from '../../chain/utils/getChainEntityIconSrc';
import { isNativeCoin } from '../../chain/utils/isNativeCoin';
import { chainTokens } from '../../coin/chainTokens';
import { getBalanceQueryKey } from '../../coin/query/useBalanceQuery';
import { useSaveCoinsMutation } from '../../coin/query/useSaveCoinsMutation';
import {
  getTokensAutoDiscoveryQueryKey,
  useTokensAutoDiscoveryQuery,
} from '../../coin/query/useTokensAutoDiscoveryQuery';
import { coinToStorageCoin } from '../../coin/utils/coin';
import { createCoin } from '../../coin/utils/createCoin';
import { getCoinValue } from '../../coin/utils/getCoinValue';
import { sortCoinsByBalance } from '../../coin/utils/sortCoinsByBalance';
import { getStorageCoinKey } from '../../coin/utils/storageCoin';
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
import { splitBy } from '@lib/utils/array/splitBy';
import { sum } from '@lib/utils/array/sum';
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates';
import { formatAmount } from '@lib/utils/formatAmount';
import { makeAppPath } from '../../navigation';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import {
  PersistentStateKey,
  usePersistentState,
} from '../../state/persistentState';
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderIconButton } from '../../ui/page/PageHeaderIconButton';
import { PageHeaderIconButtons } from '../../ui/page/PageHeaderIconButtons';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { BalanceVisibilityAware } from '../balance/visibility/BalanceVisibilityAware';
import { VaultPrimaryActions } from '../components/VaultPrimaryActions';
import { useVaultPublicKeyQuery } from '../publicKey/queries/useVaultPublicKeyQuery';
import { useVaultAddressQuery } from '../queries/useVaultAddressQuery';
import { useVaultChainCoinsQuery } from '../queries/useVaultChainCoinsQuery';
import {
  useCurrentVaultChainCoins,
  useCurrentVaultNativeCoin,
} from '../state/currentVault';
import { ManageVaultChainCoinsPrompt } from './manage/coin/ManageVaultChainCoinsPrompt';
import { useCurrentVaultChain } from './useCurrentVaultChain';
import { VaultAddressLink } from './VaultAddressLink';
import { VaultChainCoinItem } from './VaultChainCoinItem';

export const VaultChainPage = () => {
  const [, setAllChainTokens] = usePersistentState<
    Record<string, storage.Coin[]>
  >(PersistentStateKey.ChainAllTokens, {});
  const chain = useCurrentVaultChain();
  const currentChainCoins = useCurrentVaultChainCoins(chain);
  const invalidateQueries = useInvalidateQueries();
  const { globalCurrency } = useGlobalCurrency();
  const publicKeyQuery = useVaultPublicKeyQuery(chain);
  const vaultAddressQuery = useVaultAddressQuery(chain);
  const vaultCoinsQuery = useVaultChainCoinsQuery(chain);
  const nativeCoin = useCurrentVaultNativeCoin(chain);
  const copyAddress = useCopyAddress();
  const storageCoinKey = getStorageCoinKey(nativeCoin);
  const invalidateQueryKey = getBalanceQueryKey(storageCoinKey);
  const walletCore = useAssertWalletCore();
  const { t } = useTranslation();
  const { mutate: saveCoins } = useSaveCoinsMutation();

  const account = useMemo(
    () => ({
      address: nativeCoin.address,
      chain,
    }),
    [nativeCoin.address, chain]
  );

  const findTokensQuery = useTokensAutoDiscoveryQuery(account);
  const { mutate: refreshBalance, isPending } = useMutation({
    mutationFn: () => {
      return invalidateQueries(
        invalidateQueryKey,
        getTokensAutoDiscoveryQueryKey(account)
      );
    },
  });

  // It's a bad solution, but better than what we had before
  // TODO: Implement an abstraction auto-discovery mechanism at the root of the app
  useEffect(() => {
    if (findTokensQuery.data && publicKeyQuery.data) {
      saveCoins(
        findTokensQuery.data.map(coinMeta =>
          coinToStorageCoin(
            createCoin({
              coinMeta,
              publicKey: publicKeyQuery.data,
              walletCore,
            })
          )
        )
      );

      setAllChainTokens(pv => ({
        ...pv,
        [chain]: withoutDuplicates(
          [
            ...currentChainCoins,
            ...findTokensQuery.data.map(coinMeta =>
              coinToStorageCoin(
                createCoin({
                  coinMeta,
                  publicKey: publicKeyQuery.data,
                  walletCore,
                })
              )
            ),
          ],
          (a, b) => a.ticker === b.ticker
        ),
      }));
    }
  }, [
    chain,
    currentChainCoins,
    findTokensQuery.data,
    publicKeyQuery.data,
    saveCoins,
    setAllChainTokens,
    walletCore,
  ]);

  const hasMultipleCoinsSupport = chain in chainTokens;

  return (
    <VStack flexGrow>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <PageHeaderIconButtons>
            <PageHeaderIconButton
              onClick={() => {
                refreshBalance();
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
              const orderedCoins = withoutDuplicates(
                splitBy(coins, coin => (isNativeCoin(coin) ? 0 : 1))
                  .map(sortCoinsByBalance)
                  .flat(),
                (one, another) => one.ticker === another.ticker
              );

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
