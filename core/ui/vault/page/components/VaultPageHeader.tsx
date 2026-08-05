import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { useVaultTotalBalanceQuery } from '@core/ui/vault/queries/useVaultTotalBalanceQuery'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { verticalPadding } from '@lib/ui/css/verticalPadding'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { ReactNode, RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import {
  getCollapsedHeaderOpacity,
  useVaultHeaderCollapseProgress,
} from './vaultHeaderCollapse'
import { VaultPageHeaderControls } from './VaultPageHeaderControls'
import { VaultSelector } from './VaultSelector'

const HeaderContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 1;
  display: grid;
  background: ${getColor('background')};
`

const CollapsedContent = styled(HStack)`
  ${horizontalPadding(pageConfig.horizontalPadding)};
  ${verticalPadding(pageConfig.verticalPadding)};
  grid-area: 1 / 1;
  min-height: 60px;
  border-bottom: 1px solid ${getColor('foregroundExtra')};
  justify-content: space-between;
  align-items: center;
  background: ${getColor('background')};
`

const NormalContent = styled.div`
  grid-area: 1 / 1;
`

type VaultPageHeaderProps = {
  vault: Vault
  scrollContainerRef: RefObject<HTMLElement>
  primaryControls?: ReactNode
}

export const VaultPageHeader = ({
  vault,
  scrollContainerRef,
  primaryControls,
}: VaultPageHeaderProps) => {
  const progress = useVaultHeaderCollapseProgress(scrollContainerRef)
  const collapsedOpacity = getCollapsedHeaderOpacity(progress)
  const isCollapsed = collapsedOpacity > 0.5
  const { t } = useTranslation()

  const { data: totalBalance = 0 } = useVaultTotalBalanceQuery()
  const formatFiatAmount = useFormatFiatAmount()
  const formattedBalance = formatFiatAmount(totalBalance)

  return (
    <HeaderContainer>
      <CollapsedContent
        style={{
          opacity: collapsedOpacity,
          pointerEvents: isCollapsed ? 'auto' : 'none',
        }}
      >
        <VaultSelector value={vault} />
        <VStack alignItems="flex-end" gap={2} style={{ flexShrink: 0 }}>
          <Text size={12} color="shy">
            {t('portfolio_balance')}
          </Text>
          <Text size={14}>
            <BalanceVisibilityAware>{formattedBalance}</BalanceVisibilityAware>
          </Text>
        </VStack>
      </CollapsedContent>

      <NormalContent
        style={{
          opacity: 1 - collapsedOpacity,
          pointerEvents: isCollapsed ? 'none' : 'auto',
        }}
      >
        <PageHeader
          hasBorder
          primaryControls={primaryControls}
          secondaryControls={<VaultPageHeaderControls />}
          title={<VaultSelector placement="pageHeader" value={vault} />}
        />
      </NormalContent>
    </HeaderContainer>
  )
}
