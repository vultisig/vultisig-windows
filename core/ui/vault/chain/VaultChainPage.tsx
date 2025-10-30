import { getChainKind } from '@core/chain/ChainKind'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { coinFinderChainKinds } from '@core/chain/coin/find/CoinFinderChainKind'
import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { getCoinFinderQueryKey } from '@core/ui/vault/chain/coin/finder/queries/useCoinFinderQuery'
import { useCurrentVaultChain } from '@core/ui/vault/chain/useCurrentVaultChain'
import {
  BottomNavigation,
  bottomNavigationHeight,
} from '@core/ui/vault/components/BottomNavigation'
import { VaultHeader } from '@core/ui/vault/components/VaultHeader'
import {
  useCurrentVaultAddress,
  useCurrentVaultChainCoins,
} from '@core/ui/vault/state/currentVaultCoins'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { RefreshCwIcon } from '@lib/ui/icons/RefreshCwIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { useInvalidateQueriesMutation } from '@lib/ui/query/hooks/useInvalidateQueriesMutation'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { QueryKey } from '@tanstack/react-query'
import { useCallback } from 'react'
import styled from 'styled-components'

import { VaultChainTabs } from './tabs/VaultChainTabs'
import { VaultChainOverview } from './VaultChainOverview'

export const VaultChainPage = () => {
  const chain = useCurrentVaultChain()
  const vaultCoins = useCurrentVaultChainCoins(chain)

  const address = useCurrentVaultAddress(chain)

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
    <Wrapper justifyContent="space-between" flexGrow>
      <VStack flexGrow>
        <VaultHeader
          primaryControls={<PageHeaderBackButton />}
          showRefresh
          refreshButton={
            <IconButton loading={isPending} onClick={refresh}>
              <RefreshCwIcon />
            </IconButton>
          }
        />
        <StyledPageContent scrollable gap={32} flexGrow>
          <VaultChainOverview />
          <VaultChainTabs />
        </StyledPageContent>
      </VStack>
      <BottomNavigation />
    </Wrapper>
  )
}

const Wrapper = styled(VStack)`
  position: relative;
  margin-bottom: ${bottomNavigationHeight}px;
`

const StyledPageContent = styled(PageContent)`
  ${hideScrollbars};
`
