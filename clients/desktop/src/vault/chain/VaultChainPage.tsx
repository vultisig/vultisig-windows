import { getChainKind } from '@core/chain/ChainKind'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { chainTokens } from '@core/chain/coin/chainTokens'
import { coinFinderChainKinds } from '@core/chain/coin/find/CoinFinderChainKind'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { sortCoinsByBalance } from '@core/chain/coin/utils/sortCoinsByBalance'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainEntityIconSrc } from '@core/ui/chain/coin/icon/utils/getChainEntityIconSrc'
import { useFiatCurrency } from '@core/ui/state/fiatCurrency'
import {
  useCurrentVaultAddress,
  useCurrentVaultNativeCoin,
} from '@core/ui/vault/state/currentVaultCoins'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CopyIcon } from '@lib/ui/icons/CopyIcon'
import { RefreshIcon } from '@lib/ui/icons/RefreshIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Panel } from '@lib/ui/panel/Panel'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useInvalidateQueriesMutation } from '@lib/ui/query/hooks/useInvalidateQueriesMutation'
import { Text } from '@lib/ui/text'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { splitBy } from '@lib/utils/array/splitBy'
import { sum } from '@lib/utils/array/sum'
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'
import { formatAmount } from '@lib/utils/formatAmount'
import { QueryKey } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { AddressPageShyPrompt } from '../../chain/components/address/AddressPageShyPrompt'
import { useCopyAddress } from '../../chain/ui/hooks/useCopyAddress'
import { getBalanceQueryKey } from '../../coin/query/useBalancesQuery'
import { makeAppPath } from '../../navigation'
import { PageHeaderIconButtons } from '../../ui/page/PageHeaderIconButtons'
import { BalanceVisibilityAware } from '../balance/visibility/BalanceVisibilityAware'
import { VaultPrimaryActions } from '../components/VaultPrimaryActions'
import { useVaultChainCoinsQuery } from '../queries/useVaultChainCoinsQuery'
import { getCoinFinderQueryKey } from './coin/finder/queries/useCoinFinderQuery'
import { ManageVaultChainCoinsPrompt } from './manage/coin/ManageVaultChainCoinsPrompt'
import { useCurrentVaultChain } from './useCurrentVaultChain'
import { VaultAddressLink } from './VaultAddressLink'
import { VaultChainCoinItem } from './VaultChainCoinItem'

export const VaultChainPage = () => {
  const chain = useCurrentVaultChain()
  const fiatCurrency = useFiatCurrency()
  const vaultCoinsQuery = useVaultChainCoinsQuery(chain)
  const nativeCoin = useCurrentVaultNativeCoin(chain)
  const copyAddress = useCopyAddress()

  const { t } = useTranslation()
  const address = useCurrentVaultAddress(chain)

  const { mutate: invalidateQueries, isPending } =
    useInvalidateQueriesMutation()

  const refresh = useCallback(() => {
    const keys: QueryKey[] = [
      getBalanceQueryKey(extractAccountCoinKey(nativeCoin)),
    ]

    const chainKind = getChainKind(chain)
    if (isOneOf(chainKind, coinFinderChainKinds)) {
      keys.push(getCoinFinderQueryKey({ address, chain }))
    }

    invalidateQueries(keys)
  }, [address, chain, invalidateQueries, nativeCoin])

  const hasMultipleCoinsSupport = chain in chainTokens

  return (
    <VStack flexGrow>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <PageHeaderIconButtons>
            <PageHeaderIconButton
              onClick={refresh}
              icon={isPending ? <Spinner /> : <RefreshIcon />}
            />
          </PageHeaderIconButtons>
        }
        title={<PageHeaderTitle>{chain}</PageHeaderTitle>}
      />
      <PageContent gap={16} data-testid="VaultChainPage-Content">
        <VaultPrimaryActions value={nativeCoin} />
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
              <HStack>
                <IconButton
                  onClick={() => copyAddress(address)}
                  title="Copy address"
                  icon={<CopyIcon />}
                />
                <AddressPageShyPrompt value={address} />
                <VaultAddressLink value={address} />
              </HStack>
            </HStack>
            <MatchQuery
              value={vaultCoinsQuery}
              error={() => t('failed_to_load')}
              pending={() => <Spinner />}
              success={coins => {
                const total = sum(
                  coins.map(({ amount, decimals, price = 0 }) =>
                    getCoinValue({
                      amount,
                      decimals,
                      price,
                    })
                  )
                )

                return (
                  <Text
                    size={20}
                    weight="700"
                    color="contrast"
                    centerVertically
                  >
                    <BalanceVisibilityAware>
                      {formatAmount(total, fiatCurrency)}
                    </BalanceVisibilityAware>
                  </Text>
                )
              }}
            />
            <Text size={14} weight="500" color="primary">
              <BalanceVisibilityAware size="xxxl">
                {address}
              </BalanceVisibilityAware>
            </Text>
          </VStack>
          <MatchQuery
            value={vaultCoinsQuery}
            error={() => t('failed_to_load')}
            pending={() => (
              <VStack fullWidth>
                <Spinner />
              </VStack>
            )}
            success={coins => {
              const orderedCoins = withoutDuplicates(
                splitBy(coins, coin => (isFeeCoin(coin) ? 0 : 1))
                  .map(sortCoinsByBalance)
                  .flat(),
                (one, another) => one.ticker === another.ticker
              )

              return orderedCoins.map(coin => (
                <Link
                  key={coin.id}
                  to={makeAppPath('vaultChainCoinDetail', {
                    chain: chain,
                    coin: coin.id,
                  })}
                >
                  <VaultChainCoinItem value={coin} />
                </Link>
              ))
            }}
          />
        </Panel>
        {hasMultipleCoinsSupport && (
          <ManageVaultChainCoinsPrompt value={chain} />
        )}
      </PageContent>
    </VStack>
  )
}
