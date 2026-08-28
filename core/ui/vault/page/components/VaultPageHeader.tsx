import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import {
  getCollapsedHeaderOpacity,
  getNormalHeaderOpacity,
  isHeaderCollapsed,
  useHeaderCollapseProgress,
} from '@core/ui/page/headerCollapse'
import { useCore } from '@core/ui/state/core'
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
import styled, { css } from 'styled-components'

import { VaultPageHeaderControls } from './VaultPageHeaderControls'
import { VaultPageHeaderRow } from './VaultPageHeaderRow'
import { VaultSelector } from './VaultSelector'

const HeaderContainer = styled.div<{ $isExtension: boolean }>`
  position: sticky;
  top: 0;
  z-index: 1;
  display: grid;
  background: ${getColor('background')};
  border-bottom: 1px solid ${getColor('foregroundExtra')};

  ${({ $isExtension }) =>
    $isExtension &&
    css`
      box-sizing: border-box;
      height: 56px;
      backdrop-filter: blur(16px);
    `}
`

const CollapsedContent = styled(HStack)<{ $isExtension: boolean }>`
  grid-area: 1 / 1;
  justify-content: space-between;
  align-items: center;
  background: ${getColor('background')};

  ${({ $isExtension }) =>
    $isExtension
      ? css`
          height: 100%;
          padding: 8px 8px 8px 16px;
        `
      : css`
          ${horizontalPadding(pageConfig.horizontalPadding)};
          ${verticalPadding(pageConfig.verticalPadding)};
          min-height: 60px;
        `}
`

const NormalContent = styled.div<{ $isExtension: boolean }>`
  display: grid;
  grid-area: 1 / 1;

  ${({ $isExtension }) => $isExtension && `height: 100%;`}
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
  const { client } = useCore()
  const isExtension = client === 'extension'
  const progress = useHeaderCollapseProgress(scrollContainerRef)
  const isCollapsed = isHeaderCollapsed(progress)
  const { t } = useTranslation()

  const { data: totalBalance, error } = useVaultTotalBalanceQuery()
  const formatFiatAmount = useFormatFiatAmount()
  const formattedBalance =
    totalBalance === undefined ? undefined : formatFiatAmount(totalBalance)

  return (
    <HeaderContainer $isExtension={isExtension} data-testid="vault-page-header">
      <CollapsedContent
        $isExtension={isExtension}
        style={{
          opacity: getCollapsedHeaderOpacity(progress),
          pointerEvents: isCollapsed ? 'auto' : 'none',
        }}
      >
        <VaultSelector isExtension={isExtension} value={vault} />
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
        $isExtension={isExtension}
        style={{
          opacity: getNormalHeaderOpacity(progress),
          pointerEvents: isCollapsed ? 'none' : 'auto',
        }}
      >
        <VaultPageHeaderRow
          isExtension={isExtension}
          primaryControls={primaryControls}
          secondaryControls={<VaultPageHeaderControls />}
          title={
            <VaultSelector
              isExtension={isExtension}
              placement="pageHeader"
              value={vault}
            />
          }
        />
      </NormalContent>
    </HeaderContainer>
  )
}
