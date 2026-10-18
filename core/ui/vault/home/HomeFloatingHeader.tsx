import {
  getContentBalanceOpacity,
  getHeaderCollapseProgress,
} from '@core/ui/page/headerCollapse'
import { useCore } from '@core/ui/state/core'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { vStack } from '@lib/ui/layout/Stack'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { motion, useTransform } from 'framer-motion'
import { WheelEvent } from 'react'
import styled, { css } from 'styled-components'

import { VaultOverviewPrimaryActions } from '../page/components/VaultOverviewPrimaryActions'
import { homeHeaderHeightVar } from './HomeHeaderSlot'
import { useHomeMotion } from './homeMotion'
import { HomePageContent } from './HomePageContent'
import { homeTabs } from './homeTab'
import { HomeTotalBalance } from './HomeTotalBalance'
import { useHomeScrollOffset } from './useHomeScrollOffset'

/** Drawn once over both pages and blended between their slots mid-slide, so it never slides sideways or appears twice. */
export const HomeFloatingHeader = () => {
  const { client } = useCore()
  const isExtension = client === 'extension'
  const { position, scrollContainers } = useHomeMotion()
  const scrollOffset = useHomeScrollOffset()
  const y = useTransform(scrollOffset, offset => -offset)
  const balanceOpacity = useTransform(scrollOffset, offset =>
    getContentBalanceOpacity(getHeaderCollapseProgress(offset))
  )
  const balancePointerEvents = useTransform(balanceOpacity, opacity =>
    opacity === 0 ? 'none' : 'auto'
  )

  const measureRef = (element: HTMLElement | null) => {
    // The pager viewport: the slots in both pages read the height from it.
    const slotOwner = element?.parentElement?.parentElement
    if (!element || !slotOwner) return

    const observer = new ResizeObserver(() => {
      slotOwner.style.setProperty(
        homeHeaderHeightVar,
        `${element.offsetHeight}px`
      )
    })
    observer.observe(element)

    return () => observer.disconnect()
  }

  // The header sits above the pages' scroll containers, so a vertical wheel
  // over it is handed to the page underneath.
  const handleWheel = (event: WheelEvent) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
    const tab = homeTabs[Math.round(position.get())]
    scrollContainers.get(tab)?.scrollBy({ top: event.deltaY })
  }

  return (
    <Layer $isExtension={isExtension} style={{ y }}>
      <BlurEffect />
      <BalanceWrapper
        ref={measureRef}
        $isExtension={isExtension}
        onWheel={handleWheel}
        data-testid="vault-overview-balance-wrapper"
      >
        <motion.div
          style={{
            opacity: balanceOpacity,
            pointerEvents: balancePointerEvents,
          }}
        >
          <HomeTotalBalance />
        </motion.div>
        <VaultOverviewPrimaryActions />
      </BalanceWrapper>
    </Layer>
  )
}

const LayerContent = styled(HomePageContent)`
  position: absolute;
  inset: 0 0 auto 0;
  z-index: 1;
  pointer-events: none;
  overflow: visible;
`

// Wrapping the styled component (not the reverse) keeps `$isExtension`
// reaching the shared page padding.
const Layer = motion.create(LayerContent)

const BalanceWrapper = styled.div<{ $isExtension: boolean }>`
  position: relative;
  pointer-events: auto;

  ${({ $isExtension, theme }) =>
    $isExtension
      ? css`
          ${vStack({ alignItems: 'center', gap: 32 })};
          flex-shrink: 0;
          height: 178px;
          min-height: 178px;
          max-height: 178px;
        `
      : css`
          ${vStack({ alignItems: 'center', gap: 24 })};

          ${theme.iconStyle === 'station' &&
          css`
            gap: 20px;
          `}
        `}
`

// eslint-disable-next-line local/no-hardcoded-border-radius -- a decorative glow, not a surface
const BlurEffect = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  ${borderRadius.lg};
  border-radius: 350px;
  height: 200px;
  top: -25px;
  width: 350px;
  opacity: 0.7;
  background: radial-gradient(
    50% 50% at 50% 50%,
    rgba(4, 57, 199, 0.5) 0%,
    rgba(2, 18, 43, 0) 100%
  );
  filter: blur(36px);
  pointer-events: none;

  @media ${mediaQuery.tabletDeviceAndUp} {
    height: 250px;
    width: 600px;
  }

  ${({ theme }) =>
    theme.iconStyle === 'station' &&
    css`
      display: none;
    `}
`
