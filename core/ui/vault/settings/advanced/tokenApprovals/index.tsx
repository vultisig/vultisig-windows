import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { VStack } from '@lib/ui/layout/Stack'
import { useViewState } from '@lib/ui/navigation/hooks/useViewState'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TokenApprovalsChain } from './core/tokenApprovalsChains'
import { useTokenApprovalsQueries } from './queries/useTokenApprovalsQueries'
import { TokenApprovalsChainField } from './TokenApprovalsChainField'
import { TokenApprovalsChainSelect } from './TokenApprovalsChainSelect'
import { TokenApprovalsContent } from './TokenApprovalsContent'
import { TokenApprovalsPageContent } from './TokenApprovalsPageContent'

type TokenApprovalsViewState = { chain: TokenApprovalsChain } | undefined

/**
 * Granted Approvals page: ERC-20 and Permit2 allowances on the vault's EVM
 * chains and SPL token delegates on Solana, in one list that can be narrowed
 * to one chain. Each row's revoke opens the verify screen for a transaction
 * that clears it.
 */
export const TokenApprovalsPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { chains, uncheckedChains } = useTokenApprovalsQueries()
  // Kept in the view state so coming back from a revoke shows the same chain.
  const [viewState, setViewState] = useViewState<TokenApprovalsViewState>()
  const [isSelectingChain, setIsSelectingChain] = useState(false)
  const options = chains.map(({ chain }) => chain)
  // A chain the vault no longer has would match nothing and read as "No active approvals".
  const selectedChain =
    viewState && options.includes(viewState.chain) ? viewState.chain : null
  const shownChains = selectedChain
    ? chains.filter(({ chain }) => chain === selectedChain)
    : chains

  if (isSelectingChain) {
    return (
      <TokenApprovalsChainSelect
        value={selectedChain}
        onChange={chain => {
          setViewState(chain ? { chain } : undefined)
          setIsSelectingChain(false)
        }}
        options={options}
        onBack={() => setIsSelectingChain(false)}
      />
    )
  }

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('granted_approvals')}
        hasBorder
      />
      <TokenApprovalsPageContent gap={14} scrollable>
        {options.length > 0 ? (
          <TokenApprovalsChainField
            value={selectedChain}
            onClick={() => setIsSelectingChain(true)}
          />
        ) : null}
        <TokenApprovalsContent
          chains={shownChains}
          uncheckedChains={selectedChain ? [] : uncheckedChains}
          onRevoke={approval =>
            navigate({ id: 'revokeTokenApproval', state: { approval } })
          }
        />
      </TokenApprovalsPageContent>
    </VStack>
  )
}
