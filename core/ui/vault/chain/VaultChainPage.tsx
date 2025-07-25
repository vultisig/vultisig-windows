import { getChainKind } from '@core/chain/ChainKind'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { extractCoinKey } from '@core/chain/coin/Coin'
import { coinFinderChainKinds } from '@core/chain/coin/find/CoinFinderChainKind'
import { knownTokens } from '@core/chain/coin/knownTokens'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { sortCoinsByBalance } from '@core/chain/coin/utils/sortCoinsByBalance'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useCopyAddress } from '@core/ui/chain/hooks/useCopyAddress'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { getCoinFinderQueryKey } from '@core/ui/vault/chain/coin/finder/queries/useCoinFinderQuery'
import { adjustVaultChainCoinsLogos } from '@core/ui/vault/chain/manage/coin/adjustVaultChainCoinsLogos'
import { useCurrentVaultChain } from '@core/ui/vault/chain/useCurrentVaultChain'
import { VaultAddressLink } from '@core/ui/vault/chain/VaultAddressLink'
import { VaultChainCoinItem } from '@core/ui/vault/chain/VaultChainCoinItem'
import { VaultPrimaryActions } from '@core/ui/vault/components/VaultPrimaryActions'
import { useVaultChainCoinsQuery } from '@core/ui/vault/queries/useVaultChainCoinsQuery'
import {
  useCurrentVaultAddress,
  useCurrentVaultChainCoins,
} from '@core/ui/vault/state/currentVaultCoins'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CopyIcon } from '@lib/ui/icons/CopyIcon'
import { QrCodeIcon } from '@lib/ui/icons/QrCodeIcon'
import { RefreshCwIcon } from '@lib/ui/icons/RefreshCwIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ListAddButton } from '@lib/ui/list/ListAddButton'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
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

export const VaultChainPage = () => {
  const { t } = useTranslation()
  const chain = useCurrentVaultChain()
  const vaultCoinsQuery = useVaultChainCoinsQuery(chain)
  const fiatCurrency = useFiatCurrency()
  const vaultCoins = useCurrentVaultChainCoins(chain)
  const address = useCurrentVaultAddress(chain)
  const hasMultipleCoinsSupport = knownTokens[chain].length > 0
  const copyAddress = useCopyAddress()
  const navigate = useCoreNavigate()

  const { mutate: invalidateQueries, isPending } =
    useInvalidateQueriesMutation()

  const refresh = useCallback(() => {
    const keys: QueryKey[] = vaultCoins.map(coin =>
      getBalanceQueryKey(extractAccountCoinKey(coin))
    )

    const chainKind = getChainKind(chain)
    if (isOneOf(chainKind, coinFinderChainKinds)) {
      keys.push(getCoinFinderQueryKey({ address, chain }))
    }

    invalidateQueries(keys)
  }, [address, chain, invalidateQueries, vaultCoins])

  return (
    <VStack flexGrow>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <IconButton loading={isPending} onClick={refresh}>
            <RefreshCwIcon />
          </IconButton>
        }
        title={chain}
        hasBorder
      />
      <PageContent gap={16} flexGrow>
        <VaultPrimaryActions fromChain={chain} coin={vaultCoins[0]} />
        <Panel withSections>
          <VStack fullWidth gap={8}>
            <HStack
              fullWidth
              alignItems="center"
              justifyContent="space-between"
            >
              <HStack alignItems="center" gap={12}>
                <ChainEntityIcon
                  value={getChainLogoSrc(chain)}
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
                >
                  <CopyIcon />
                </IconButton>
                <IconButton
                  onClick={() =>
                    navigate({ id: 'address', state: { address } })
                  }
                  title="Address QR code"
                >
                  <QrCodeIcon />
                </IconButton>
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
              ).map(adjustVaultChainCoinsLogos)

              return orderedCoins.map(coin => (
                <UnstyledButton
                  key={coin.id}
                  onClick={() =>
                    navigate({
                      id: 'vaultChainCoinDetail',
                      state: { coin: extractCoinKey(coin) },
                    })
                  }
                >
                  <VaultChainCoinItem value={coin} />
                </UnstyledButton>
              ))
            }}
          />
        </Panel>
        {hasMultipleCoinsSupport && (
          <ListAddButton
            onClick={() =>
              navigate({ id: 'manageVaultChainCoins', state: { chain } })
            }
          >
            {t('choose_tokens')}
          </ListAddButton>
        )}
      </PageContent>
    </VStack>
  )
}
