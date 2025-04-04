import { RefreshIcon } from '@lib/ui/icons/RefreshIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useInvalidateQueriesMutation } from '@lib/ui/query/hooks/useInvalidateQueriesMutation'
import { useTranslation } from 'react-i18next'

import { useBalanceQuery } from '../../../coin/query/useBalanceQuery'
import { getBalanceQueryKey } from '../../../coin/query/useBalancesQuery'
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery'
import { Center } from '../../../lib/ui/layout/Center'
import { Spinner } from '../../../lib/ui/loaders/Spinner'
import { Panel } from '../../../lib/ui/panel/Panel'
import { PageContent } from '../../../ui/page/PageContent'
import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton'
import { PageHeaderIconButton } from '../../../ui/page/PageHeaderIconButton'
import { PageHeaderIconButtons } from '../../../ui/page/PageHeaderIconButtons'
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle'
import { VaultPrimaryActions } from '../../components/VaultPrimaryActions'
import { useCurrentVaultCoin } from '../../state/currentVault'
import { VaultChainCoinItem } from '../VaultChainCoinItem'
import { useCurrentVaultCoinKey } from './useCurrentVaultCoinKey'

export const VaultChainCoinPage = () => {
  const coinKey = useCurrentVaultCoinKey()
  const coin = useCurrentVaultCoin(coinKey)

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
                invalidateQueries(
                  getBalanceQueryKey({
                    ...coinKey,
                    address: coin.address,
                  })
                )
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
