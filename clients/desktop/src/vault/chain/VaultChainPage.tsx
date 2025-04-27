import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { chainTokens } from '@core/chain/coin/chainTokens'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { sortCoinsByBalance } from '@core/chain/coin/utils/sortCoinsByBalance'
import { coinFinderChains } from '@core/ui/chain/coin/finder/findCoins/coinFinderChains'
import { getCoinFinderQueryKey } from '@core/ui/chain/coin/finder/queries/useCoinFinderQuery'
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
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { Text } from '@lib/ui/text'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { splitBy } from '@lib/utils/array/splitBy'
import { sum } from '@lib/utils/array/sum'
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'
import { formatAmount } from '@lib/utils/formatAmount'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { AddressPageShyPrompt } from '../../chain/components/address/AddressPageShyPrompt'
import { useCopyAddress } from '../../chain/ui/hooks/useCopyAddress'
import { getBalanceQueryKey } from '../../coin/query/useBalancesQuery'
import { useSaveCoinsMutation } from '../../coin/query/useSaveCoinsMutation'
import {
  getTokensAutoDiscoveryQueryKey,
  useTokensAutoDiscoveryQuery,
} from '../../coin/query/useTokensAutoDiscoveryQuery'
import { makeAppPath } from '../../navigation'
import { PageHeaderIconButtons } from '../../ui/page/PageHeaderIconButtons'
import { BalanceVisibilityAware } from '../balance/visibility/BalanceVisibilityAware'
import { VaultPrimaryActions } from '../components/VaultPrimaryActions'
import { useVaultChainCoinsQuery } from '../queries/useVaultChainCoinsQuery'
import { ManageVaultChainCoinsPrompt } from './manage/coin/ManageVaultChainCoinsPrompt'
import { useCurrentVaultChain } from './useCurrentVaultChain'
import { VaultAddressLink } from './VaultAddressLink'
import { VaultChainCoinItem } from './VaultChainCoinItem'

export const VaultChainPage = () => {
  const chain = useCurrentVaultChain()
  const invalidateQueries = useInvalidateQueries()
  const fiatCurrency = useFiatCurrency()
  const vaultCoinsQuery = useVaultChainCoinsQuery(chain)
  const nativeCoin = useCurrentVaultNativeCoin(chain)
  const copyAddress = useCopyAddress()
  const invalidateQueryKey = getBalanceQueryKey(
    extractAccountCoinKey(nativeCoin)
  )
  const { t } = useTranslation()
  const { mutate: saveCoins } = useSaveCoinsMutation()
  const address = useCurrentVaultAddress(chain)

  const account = useMemo(
    () => ({
      address: nativeCoin.address,
      chain,
    }),
    [nativeCoin.address, chain]
  )

  const findTokensQuery = useTokensAutoDiscoveryQuery(account)
  const { mutate: refreshBalance, isPending } = useMutation({
    mutationFn: () => {
      const keys = [invalidateQueryKey, getTokensAutoDiscoveryQueryKey(account)]

      if (isOneOf(chain, coinFinderChains)) {
        keys.push(getCoinFinderQueryKey({ address, chain }))
      }

      return invalidateQueries(...keys)
    },
  })

  useEffect(() => {
    // Ensure findTokensQuery.data is an array
    const tokens = Array.isArray(findTokensQuery.data)
      ? findTokensQuery.data
      : []

    if (tokens.length > 0) {
      saveCoins(
        tokens.map(coin => ({
          ...coin,
          address,
        }))
      )
    }
  }, [address, findTokensQuery.data, saveCoins])

  const hasMultipleCoinsSupport = chain in chainTokens

  return (
    <VStack flexGrow>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <PageHeaderIconButtons>
            <PageHeaderIconButton
              onClick={() => {
                refreshBalance()
              }}
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
