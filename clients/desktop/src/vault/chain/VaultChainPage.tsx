import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { chainTokens } from '@core/chain/coin/chainTokens'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { sortCoinsByBalance } from '@core/chain/coin/utils/sortCoinsByBalance'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { splitBy } from '@lib/utils/array/splitBy'
import { sum } from '@lib/utils/array/sum'
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'
import { formatAmount } from '@lib/utils/formatAmount'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { AddressPageShyPrompt } from '../../chain/components/address/AddressPageShyPrompt'
import { ChainEntityIcon } from '../../chain/ui/ChainEntityIcon'
import { useCopyAddress } from '../../chain/ui/hooks/useCopyAddress'
import { deriveAddress } from '../../chain/utils/deriveAddress'
import { getChainEntityIconSrc } from '../../chain/utils/getChainEntityIconSrc'
import { toHexPublicKey } from '../../chain/utils/toHexPublicKey'
import { getBalanceQueryKey } from '../../coin/query/useBalancesQuery'
import { useSaveCoinsMutation } from '../../coin/query/useSaveCoinsMutation'
import {
  getTokensAutoDiscoveryQueryKey,
  useTokensAutoDiscoveryQuery,
} from '../../coin/query/useTokensAutoDiscoveryQuery'
import { IconButton } from '../../lib/ui/buttons/IconButton'
import { CopyIcon } from '../../lib/ui/icons/CopyIcon'
import { RefreshIcon } from '../../lib/ui/icons/RefreshIcon'
import { HStack, VStack } from '../../lib/ui/layout/Stack'
import { Spinner } from '../../lib/ui/loaders/Spinner'
import { Panel } from '../../lib/ui/panel/Panel'
import { Text } from '../../lib/ui/text'
import { makeAppPath } from '../../navigation'
import { useFiatCurrency } from '../../preferences/state/fiatCurrency'
import { toStorageCoin } from '../../storage/storageCoin'
import { PageContent } from '../../ui/page/PageContent'
import { PageHeader } from '../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton'
import { PageHeaderIconButton } from '../../ui/page/PageHeaderIconButton'
import { PageHeaderIconButtons } from '../../ui/page/PageHeaderIconButtons'
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle'
import { BalanceVisibilityAware } from '../balance/visibility/BalanceVisibilityAware'
import { VaultPrimaryActions } from '../components/VaultPrimaryActions'
import { useVaultPublicKeyQuery } from '../publicKey/queries/useVaultPublicKeyQuery'
import { useVaultChainCoinsQuery } from '../queries/useVaultChainCoinsQuery'
import {
  useCurrentVaultAddress,
  useCurrentVaultNativeCoin,
} from '../state/currentVault'
import { ManageVaultChainCoinsPrompt } from './manage/coin/ManageVaultChainCoinsPrompt'
import { useCurrentVaultChain } from './useCurrentVaultChain'
import { VaultAddressLink } from './VaultAddressLink'
import { VaultChainCoinItem } from './VaultChainCoinItem'

export const VaultChainPage = () => {
  const chain = useCurrentVaultChain()
  const invalidateQueries = useInvalidateQueries()
  const [fiatCurrency] = useFiatCurrency()
  const publicKeyQuery = useVaultPublicKeyQuery(chain)
  const vaultCoinsQuery = useVaultChainCoinsQuery(chain)
  const nativeCoin = useCurrentVaultNativeCoin(chain)
  const copyAddress = useCopyAddress()
  const invalidateQueryKey = getBalanceQueryKey(
    extractAccountCoinKey(nativeCoin)
  )
  const walletCore = useAssertWalletCore()
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
      return invalidateQueries(
        invalidateQueryKey,
        getTokensAutoDiscoveryQueryKey(account)
      )
    },
  })

  useEffect(() => {
    // Ensure findTokensQuery.data is an array
    const tokens = Array.isArray(findTokensQuery.data)
      ? findTokensQuery.data
      : []

    const isValidPublicKey =
      publicKeyQuery.data &&
      typeof publicKeyQuery.data.data === 'function' &&
      publicKeyQuery.data.data().length > 0 // Ensure it contains meaningful data

    if (tokens.length > 0 && publicKeyQuery.isSuccess && isValidPublicKey) {
      const publicKey = publicKeyQuery.data
      const address = deriveAddress({ chain, publicKey, walletCore })
      const hexPublicKey = toHexPublicKey({ publicKey, walletCore })

      saveCoins(
        tokens.map(coin =>
          toStorageCoin({
            ...coin,
            address,
            hexPublicKey,
          })
        )
      )
    }
  }, [
    chain,
    findTokensQuery.data,
    publicKeyQuery.data,
    publicKeyQuery.isSuccess,
    saveCoins,
    walletCore,
  ])

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
