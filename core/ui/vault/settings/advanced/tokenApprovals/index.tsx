import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { VStack } from '@lib/ui/layout/Stack'
import { useViewState } from '@lib/ui/navigation/hooks/useViewState'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { EvmChain } from '@vultisig/core-chain/Chain'
import { useTranslation } from 'react-i18next'

import { useTokenApprovalsQuery } from './queries/useTokenApprovalsQuery'
import { TokenApprovalsContent } from './TokenApprovalsContent'

/**
 * Token Approvals page: ERC-20 allowances the vault has granted, one EVM
 * network at a time, read from 1inch's approval history. Revoke opens the
 * verify screen for an `approve(spender, 0)` transaction.
 */
export const TokenApprovalsPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  // Kept in the view state so coming back from a revoke reopens the same
  // network.
  const [viewState, setViewState] = useViewState<
    { chain: EvmChain } | undefined
  >()
  const chain = viewState?.chain ?? EvmChain.Ethereum
  const address = useCurrentVaultAddress(chain)
  const approvalsQuery = useTokenApprovalsQuery({ chain, owner: address })

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('token_approvals')}
      />
      <PageContent flexGrow scrollable>
        <TokenApprovalsContent
          value={chain}
          onChange={chain => setViewState({ chain })}
          address={address}
          approvals={approvalsQuery}
          onRevoke={({ token, spender }) =>
            navigate({
              id: 'revokeTokenApproval',
              state: { token, spender },
            })
          }
        />
      </PageContent>
    </VStack>
  )
}
