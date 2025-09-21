import { getChainKind } from '@core/chain/ChainKind'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { coinFinderChainKinds } from '@core/chain/coin/find/CoinFinderChainKind'
import { knownTokens } from '@core/chain/coin/knownTokens'
import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { getCoinFinderQueryKey } from '@core/ui/vault/chain/coin/finder/queries/useCoinFinderQuery'
import { useCurrentVaultChain } from '@core/ui/vault/chain/useCurrentVaultChain'
import { VaultPrimaryActions } from '@core/ui/vault/components/VaultPrimaryActions'
import {
  useCurrentVaultAddress,
  useCurrentVaultChainCoins,
} from '@core/ui/vault/state/currentVaultCoins'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { RefreshCwIcon } from '@lib/ui/icons/RefreshCwIcon'
import { ListAddButton } from '@lib/ui/list/ListAddButton'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useInvalidateQueriesMutation } from '@lib/ui/query/hooks/useInvalidateQueriesMutation'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { QueryKey } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { VaultChainPositionsSection } from './positions/VaultChainPositionsSection'
import { VaultChainBalancesSection } from './VaultChainBalancesSection'

export const VaultChainPage = () => {
  const { t } = useTranslation()
  const chain = useCurrentVaultChain()
  const vaultCoins = useCurrentVaultChainCoins(chain)

  const address = useCurrentVaultAddress(chain)
  const hasMultipleCoinsSupport = knownTokens[chain].length > 0
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
    <>
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
      <PageContent gap={16} scrollable>
        <VaultPrimaryActions fromChain={chain} coin={vaultCoins[0]} />
        <VaultChainBalancesSection />
        <VaultChainPositionsSection />
      </PageContent>
      <PageFooter>
        {hasMultipleCoinsSupport && (
          <ListAddButton
            onClick={() =>
              navigate({ id: 'manageVaultChainCoins', state: { chain } })
            }
          >
            {t('choose_tokens')}
          </ListAddButton>
        )}
      </PageFooter>
    </>
  )
}
