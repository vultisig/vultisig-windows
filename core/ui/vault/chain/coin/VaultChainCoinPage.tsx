import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { adjustVaultChainCoinsLogos } from '@core/ui/vault/chain/manage/coin/adjustVaultChainCoinsLogos'
import { VaultChainCoinItem } from '@core/ui/vault/chain/VaultChainCoinItem'
import { VaultPrimaryActions } from '@core/ui/vault/components/VaultPrimaryActions'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { RefreshIcon } from '@lib/ui/icons/RefreshIcon'
import { Center } from '@lib/ui/layout/Center'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { PageHeaderIconButtons } from '@lib/ui/page/PageHeaderIconButtons'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Panel } from '@lib/ui/panel/Panel'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useInvalidateQueriesMutation } from '@lib/ui/query/hooks/useInvalidateQueriesMutation'
import { useTranslation } from 'react-i18next'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'

export const VaultChainCoinPage = () => {
  const [{ coin: coinKey }] = useCoreViewState<'vaultChainCoinDetail'>()
  const coin = adjustVaultChainCoinsLogos(useCurrentVaultCoin(coinKey))

  const balanceQuery = useBalanceQuery({
    ...coinKey,
    address: coin.address,
  })

  const priceQuery = useCoinPriceQuery({
    coin,
  })

  const { mutate: invalidateQueries, isPending: isInvalidating } =
    useInvalidateQueriesMutation()

  const { t } = useTranslation()

  return (
    <VStack flexGrow data-testid="ManageVaultChainCoinPage-Coin">
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <PageHeaderIconButtons>
            <PageHeaderIconButton
              onClick={() =>
                invalidateQueries([
                  getBalanceQueryKey({
                    ...coinKey,
                    address: coin.address,
                  }),
                ])
              }
              icon={isInvalidating ? <Spinner /> : <RefreshIcon />}
            />
          </PageHeaderIconButtons>
        }
        title={<PageHeaderTitle>{coin.ticker}</PageHeaderTitle>}
      />
      <PageContent gap={16}>
        <VaultPrimaryActions value={coin} />
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
