import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { useDefiPortfolioBalance } from '@core/ui/defi/page/hooks/useDefiPortfolios'
import { RefreshDefiData } from '@core/ui/defi/RefreshDefiData'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import {
  getCollapsedHeaderOpacity,
  getNormalHeaderOpacity,
  isHeaderCollapsed,
  useHeaderCollapseProgress,
} from '@core/ui/page/headerCollapse'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { VaultSelector } from '@core/ui/vault/page/components/VaultSelector'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { verticalPadding } from '@lib/ui/css/verticalPadding'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { SettingsIcon } from '@lib/ui/icons/SettingsIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const HeaderContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
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

type DefiPageHeaderProps = {
  vault: Vault
  scrollContainerRef: RefObject<HTMLElement>
}

export const DefiPageHeader = ({
  vault,
  scrollContainerRef,
}: DefiPageHeaderProps) => {
  const progress = useHeaderCollapseProgress(scrollContainerRef)
  const isCollapsed = isHeaderCollapsed(progress)
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  const { data: totalBalance = 0 } = useDefiPortfolioBalance()
  const formatFiatAmount = useFormatFiatAmount()
  const formattedBalance = formatFiatAmount(totalBalance)

  const headerControls = (
    <HStack gap={4} alignItems="center">
      <RefreshDefiData />
      <IconButton size="lg" onClick={() => navigate({ id: 'settings' })}>
        <IconWrapper size={24}>
          <SettingsIcon />
        </IconWrapper>
      </IconButton>
    </HStack>
  )

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
            {t('defi')}
          </Text>
          <Text size={14}>
            <BalanceVisibilityAware>{formattedBalance}</BalanceVisibilityAware>
          </Text>
        </VStack>
      </CollapsedContent>

      <NormalContent
        style={{
          opacity: getNormalHeaderOpacity(progress),
          pointerEvents: isCollapsed ? 'none' : 'auto',
        }}
      >
        <PageHeader
          secondaryControls={headerControls}
          title={<VaultSelector placement="pageHeader" value={vault} />}
        />
      </NormalContent>
    </HeaderContainer>
  )
}
