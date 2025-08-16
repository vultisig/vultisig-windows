import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { adjustVaultChainCoinsLogos } from '@core/ui/vault/chain/manage/coin/adjustVaultChainCoinsLogos'
import { VaultChainCoinItem } from '@core/ui/vault/chain/VaultChainCoinItem'
import { VaultPrimaryActions } from '@core/ui/vault/components/VaultPrimaryActions'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { RefreshCwIcon } from '@lib/ui/icons/RefreshCwIcon'
import { Center } from '@lib/ui/layout/Center'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Panel } from '@lib/ui/panel/Panel'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useInvalidateQueriesMutation } from '@lib/ui/query/hooks/useInvalidateQueriesMutation'
import { useTranslation } from 'react-i18next'

export const VaultChainCoinPage = () => {
  const { t } = useTranslation()
  const [{ coin: coinKey }] = useCoreViewState<'vaultChainCoinDetail'>()
  const coin = adjustVaultChainCoinsLogos(useCurrentVaultCoin(coinKey))
  const balanceQuery = useBalanceQuery({ ...coinKey, address: coin.address })
  const priceQuery = useCoinPriceQuery({ coin })

  const { mutate: invalidateQueries, isPending: isInvalidating } =
    useInvalidateQueriesMutation()

  return (
    <VStack flexGrow data-testid="ManageVaultChainCoinPage-Coin">
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <IconButton
            loading={isInvalidating}
            onClick={() =>
              invalidateQueries([
                getBalanceQueryKey({ ...coinKey, address: coin.address }),
              ])
            }
          >
            <RefreshCwIcon />
          </IconButton>
        }
        title={coin.ticker}
      />
      <PageContent gap={16}>
        <VaultPrimaryActions coin={coinKey} />
        <Panel>
          <MatchQuery
            value={balanceQuery}
            error={() => <Center>{t('failed_to_load')}</Center>}
            pending={() => <Center>{t('loading')}</Center>}
            success={amount => {
              const price = priceQuery.data
              return (
                <VaultChainCoinItem
                  value={{
                    amount,
                    decimals: coin.decimals,
                    logo: coin.logo,
                    ticker: coin.ticker,
                    price,
                    ...coinKey,
                  }}
                />
              )
            }}
          />
        </Panel>
      </PageContent>
    </VStack>
  )
}
