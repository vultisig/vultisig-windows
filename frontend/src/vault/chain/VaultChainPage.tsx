import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { AddressPageShyPrompt } from '../../chain/components/address/AddressPageShyPrompt';
import { ChainEntityIcon } from '../../chain/ui/ChainEntityIcon';
import { useCopyAddress } from '../../chain/ui/hooks/useCopyAddress';
import { getChainEntityIconSrc } from '../../chain/utils/getChainEntityIconSrc';
import { getBalanceQueryKey } from '../../coin/query/useBalanceQuery';
import { getCoinMetaKey } from '../../coin/utils/coinMeta';
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
import { QueryDependant } from '../../lib/ui/query/components/QueryDependant';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { getQueryDependantDefaultProps } from '../../lib/ui/query/utils/getQueryDependantDefaultProps';
import { Text } from '../../lib/ui/text';
import { isEmpty } from '../../lib/utils/array/isEmpty';
import { sum } from '../../lib/utils/array/sum';
import { formatAmount } from '../../lib/utils/formatAmount';
import { Chain } from '../../model/chain';
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
import { useAssertCurrentVaultNativeCoin } from '../state/useCurrentVault';
import { ManageVaultChainCoinsPrompt } from './manage/coin/ManageVaultChainCoinsPrompt';
import { useCurrentVaultChainId } from './useCurrentVaultChainId';
import { VaultAddressLink } from './VaultAddressLink';
import { VaultChainCoinItem } from './VaultChainCoinItem';

export const VaultChainPage = () => {
  const invalidateQueries = useInvalidateQueries();
  const { globalCurrency } = useGlobalCurrency();
  const chainId = useCurrentVaultChainId();

  const vaultAddressQuery = useVaultAddressQuery(chainId);

  const vaultCoinsQuery = useVaultChainCoinsQuery(chainId);

  const hasMultipleCoinsSupport = !isEmpty(
    TokensStore.TokenSelectionAssets.filter(
      token => token.chain === chainId && !token.isNativeToken
    )
  );

  const copyAddress = useCopyAddress();

  const nativeCoin = useAssertCurrentVaultNativeCoin(chainId);

  const { mutate: refresh, isPending } = useMutation({
    mutationFn: () => {
      return invalidateQueries(
        getBalanceQueryKey({
          ...getCoinMetaKey({
            ticker: nativeCoin.ticker,
            contractAddress: nativeCoin.contract_address,
            isNativeToken: nativeCoin.is_native_token,
            chain: nativeCoin.chain as Chain,
          }),
          address: nativeCoin.address,
        })
      );
    },
  });

  return (
    <VStack flexGrow>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <PageHeaderIconButtons>
            <PageHeaderIconButton
              onClick={() => refresh()}
              icon={isPending ? <Spinner /> : <RefreshIcon />}
            />
          </PageHeaderIconButtons>
        }
        title={<PageHeaderTitle>{chainId}</PageHeaderTitle>}
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
                  value={getChainEntityIconSrc(chainId)}
                  style={{ fontSize: 32 }}
                />
                <Text weight="700" color="contrast">
                  {chainId}
                </Text>
              </HStack>
              <QueryDependant
                query={vaultAddressQuery}
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
            <QueryDependant
              query={vaultCoinsQuery}
              {...getQueryDependantDefaultProps('vault address')}
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
            <QueryDependant
              query={vaultAddressQuery}
              {...getQueryDependantDefaultProps('vault address')}
              success={address => (
                <Text size={14} weight="500" color="primary">
                  <BalanceVisibilityAware size="xxxl">
                    {address}
                  </BalanceVisibilityAware>
                </Text>
              )}
            />
          </VStack>
          <QueryDependant
            query={vaultCoinsQuery}
            {...getQueryDependantDefaultProps('vault address')}
            success={coins => {
              return (
                <>
                  {sortCoinsByBalance(coins).map(coin => (
                    <Link
                      key={coin.id}
                      to={makeAppPath('vaultChainCoinDetail', {
                        chain: chainId,
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
          <ManageVaultChainCoinsPrompt value={chainId} />
        )}
      </PageContent>
    </VStack>
  );
};
