import {
  getCollapsedHeaderOpacity,
  getNormalHeaderOpacity,
  isHeaderCollapsed,
  useHeaderCollapseProgress,
} from '@core/ui/page/headerCollapse'
import { useCore } from '@core/ui/state/core'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { verticalPadding } from '@lib/ui/css/verticalPadding'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { ReactNode, RefObject } from 'react'
import styled, { css } from 'styled-components'

import { VaultPageHeaderRow } from './VaultPageHeaderRow'
import { VaultSelector } from './VaultSelector'

const HeaderContainer = styled.div<{ $isExtension: boolean }>`
  position: sticky;
  top: 0;
  z-index: 1;
  /* The Earn page's content is full height, which would otherwise squeeze the
     header below its fixed popup height. */
  flex-shrink: 0;
  display: grid;
  /* Both states share one implicit column, whose default auto sizing floors
     it at the widest content. A long vault name then widens the column past
     the popup and carries the controls out of view with it. */
  grid-template-columns: minmax(0, 1fr);
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

type VaultPageHeaderShellProps = {
  vault: Vault
  scrollContainerRef: RefObject<HTMLElement>
  primaryControls?: ReactNode
  secondaryControls: ReactNode
  balanceLabel: ReactNode
  balance: ReactNode
  testId: string
}

/**
 * Sticky header shared by the home tabs (Wallet, Earn). As the page scrolls it
 * hands over from the full row, with the vault selector between the controls,
 * to a collapsed row showing the vault and the tab's balance. Every tab gets
 * the same box, so switching tabs never moves the header or its controls.
 */
export const VaultPageHeaderShell = ({
  vault,
  scrollContainerRef,
  primaryControls,
  secondaryControls,
  balanceLabel,
  balance,
  testId,
}: VaultPageHeaderShellProps) => {
  const { client } = useCore()
  const isExtension = client === 'extension'
  const progress = useHeaderCollapseProgress(scrollContainerRef)
  const isCollapsed = isHeaderCollapsed(progress)

  return (
    <HeaderContainer $isExtension={isExtension} data-testid={testId}>
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
            {balanceLabel}
          </Text>
          <Text size={14}>
            <BalanceVisibilityAware>{balance}</BalanceVisibilityAware>
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
          secondaryControls={secondaryControls}
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
