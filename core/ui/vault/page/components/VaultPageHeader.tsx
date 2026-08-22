import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import {
  getCollapsedHeaderOpacity,
  getNormalHeaderOpacity,
  isHeaderCollapsed,
  useHeaderCollapseProgress,
} from '@core/ui/page/headerCollapse'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { useVaultTotalBalanceQuery } from '@core/ui/vault/queries/useVaultTotalBalanceQuery'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { verticalPadding } from '@lib/ui/css/verticalPadding'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { pageConfig } from '@lib/ui/page/config'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { ReactNode, RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { VaultPageHeaderControls } from './VaultPageHeaderControls'
import { VaultPageHeaderRow } from './VaultPageHeaderRow'
import { VaultSelector } from './VaultSelector'

const HeaderContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 1;
  display: grid;
  background: ${getColor('background')};
  border-bottom: 1px solid ${getColor('foregroundExtra')};
`

const CollapsedContent = styled(HStack)`
  ${horizontalPadding(pageConfig.horizontalPadding)};
  ${verticalPadding(pageConfig.verticalPadding)};
  grid-area: 1 / 1;
  min-height: 60px;
  justify-content: space-between;
  align-items: center;
  background: ${getColor('background')};
`

const NormalContent = styled.div`
  display: grid;
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
  const progress = useHeaderCollapseProgress(scrollContainerRef)
  const isCollapsed = isHeaderCollapsed(progress)
  const { t } = useTranslation()

  const { data: totalBalance, error } = useVaultTotalBalanceQuery()
  const formatFiatAmount = useFormatFiatAmount()
  const formattedBalance =
    totalBalance === undefined ? undefined : formatFiatAmount(totalBalance)

  return (
    <HeaderContainer>
      <CollapsedContent
        style={{
          opacity: getCollapsedHeaderOpacity(progress),
          pointerEvents: isCollapsed ? 'auto' : 'none',
        }}
      >
        <VaultSelector value={vault} />
        <VStack alignItems="flex-end" gap={2} style={{ flexShrink: 0 }}>
          <Text size={12} color="shy">
            {t('portfolio_balance')}
          </Text>
          <Text size={14}>
            <BalanceVisibilityAware>
              {error && totalBalance === undefined
                ? t('failed_to_load')
                : (formattedBalance ?? <Spinner size="0.9em" />)}
            </BalanceVisibilityAware>
          </Text>
        </VStack>
      </CollapsedContent>

      <NormalContent
        style={{
          opacity: getNormalHeaderOpacity(progress),
          pointerEvents: isCollapsed ? 'none' : 'auto',
        }}
      >
        <VaultPageHeaderRow
          primaryControls={primaryControls}
          secondaryControls={<VaultPageHeaderControls />}
          title={<VaultSelector placement="pageHeader" value={vault} />}
        />
      </NormalContent>
    </HeaderContainer>
  )
}
