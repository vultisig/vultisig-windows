import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useTranslation } from 'react-i18next'

import { useTokenApprovalsQueries } from './queries/useTokenApprovalsQueries'
import { TokenApprovalsContent } from './TokenApprovalsContent'

/**
 * Granted Approvals page: ERC-20 and Permit2 allowances on the vault's EVM
 * chains and SPL token delegates on Solana, in one list. Each row's revoke
 * opens the verify screen for a transaction that clears it.
 */
export const TokenApprovalsPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { chains, uncheckedChains } = useTokenApprovalsQueries()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('granted_approvals')}
      />
      <PageContent flexGrow scrollable>
        <TokenApprovalsContent
          chains={chains}
          uncheckedChains={uncheckedChains}
          onRevoke={approval =>
            navigate({ id: 'revokeTokenApproval', state: { approval } })
          }
        />
      </PageContent>
    </VStack>
  )
}
