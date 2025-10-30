import { getChainKind } from '@core/chain/ChainKind'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { coinFinderChainKinds } from '@core/chain/coin/find/CoinFinderChainKind'
import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { getCoinFinderQueryKey } from '@core/ui/vault/chain/coin/finder/queries/useCoinFinderQuery'
import { useCurrentVaultChain } from '@core/ui/vault/chain/useCurrentVaultChain'
import { VaultPrimaryActions } from '@core/ui/vault/components/VaultPrimaryActions'
import {
  useCurrentVaultAddress,
  useCurrentVaultChainCoins,
} from '@core/ui/vault/state/currentVaultCoins'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { RefreshCwIcon } from '@lib/ui/icons/RefreshCwIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useInvalidateQueriesMutation } from '@lib/ui/query/hooks/useInvalidateQueriesMutation'
import { getColor } from '@lib/ui/theme/getters'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { QueryKey } from '@tanstack/react-query'
import { useCallback } from 'react'
import styled from 'styled-components'

import { VaultChainTabs } from './tabs/VaultChainTabs'

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
    <VStack fullHeight>
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
      <StyledPageContent scrollable gap={32} flexGrow>
        <VStack alignItems="center" gap={24}>
          <VaultPrimaryActions coin={{ chain }} />
        </VStack>
        <Divider />
        <VaultChainTabs />
      </StyledPageContent>
    </VStack>
  )
}

const StyledPageContent = styled(PageContent)`
  ${hideScrollbars};
`

const Divider = styled.div`
  height: 1px;
  align-self: stretch;
  background: ${getColor('foregroundExtra')};
`
