import { Vault } from '@core/mpc/vault/Vault'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { useVaultTotalBalanceQuery } from '@core/ui/vault/queries/useVaultTotalBalanceQuery'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { verticalPadding } from '@lib/ui/css/verticalPadding'
import { useScroll } from '@lib/ui/hooks/useScroll'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode, RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { VaultPageHeaderControls } from './VaultPageHeaderControls'
import { VaultSelector } from './VaultSelector'

const HeaderContainer = styled.div`
  position: sticky;
  top: 0;
  background: ${getColor('background')};
`

const CollapsedContent = styled(HStack)<{ isVisible: boolean }>`
  ${horizontalPadding(pageConfig.horizontalPadding)};
  ${verticalPadding(pageConfig.verticalPadding)};
  min-height: 60px;
  border-bottom: 1px solid ${getColor('foregroundExtra')};
  justify-content: space-between;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: ${getColor('background')};
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
  transition: opacity 0.25s ease-in-out;
`

const NormalContent = styled.div<{ isVisible: boolean }>`
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
  transition: opacity 0.25s ease-in-out;
`

type VaultPageHeaderProps = {
  vault: Vault
  scrollContainerRef: RefObject<HTMLElement>
  primaryControls?: ReactNode
}

const collapseThreshold = 1

export const VaultPageHeader = ({
  vault,
  scrollContainerRef,
  primaryControls,
}: VaultPageHeaderProps) => {
  const scroll = useScroll(scrollContainerRef)
  const isCollapsed = scroll.y > collapseThreshold
  const { t } = useTranslation()

  const { data: totalBalance = 0 } = useVaultTotalBalanceQuery()
  const formatFiatAmount = useFormatFiatAmount()
  const formattedBalance = formatFiatAmount(totalBalance)

  return (
    <HeaderContainer>
      <CollapsedContent isVisible={isCollapsed}>
        <VaultSelector value={vault} />
        <VStack alignItems="flex-end" gap={2} style={{ flexShrink: 0 }}>
          <Text size={12} color="shy">
            {t('portfolio_balance')}
          </Text>
          <Text size={14}>
            <BalanceVisibilityAware size="m">
              {formattedBalance}
            </BalanceVisibilityAware>
          </Text>
        </VStack>
      </CollapsedContent>

      <NormalContent isVisible={!isCollapsed}>
        <PageHeader
          hasBorder
          primaryControls={primaryControls}
          secondaryControls={<VaultPageHeaderControls />}
          title={<VaultSelector value={vault} />}
        />
      </NormalContent>
    </HeaderContainer>
  )
}
