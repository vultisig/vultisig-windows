import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { CameraFilledIcon } from '@lib/ui/icons/CameraFilledIcon'
import { NodesIcon } from '@lib/ui/icons/NodesIcon'
import { StationWalletFilledIcon } from '@lib/ui/icons/StationFigmaIcons'
import { getColor } from '@lib/ui/theme/getters'
import {
  MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { BottomNavigationPill } from './BottomNavigationPill'
import { BottomNavigationTab } from './BottomNavigationTab'

const navHeight = 66
const cameraButtonSize = 56
const cameraButtonInset = 28

const tabs = ['wallet', 'defi'] as const
type Tab = (typeof tabs)[number]
/** How far the pill may travel past either end, in tabs. */
const indicatorOvershoot = 0.15

type AgentBottomNavigationContentProps = {
  activeTab?: Tab | 'agent'
  /**
   * Live tab position from a pager (`0` Wallet, `1` DeFi, fractional mid
   * swipe). Without it the pill rests on `activeTab`.
   */
  indicator?: MotionValue<number>
  isExtension?: boolean
  onTabChange: (tab: Tab) => void
  onCameraPress: () => void
}

export const AgentBottomNavigationContent = ({
  activeTab = 'wallet',
  indicator,
  isExtension = false,
  onTabChange,
  onCameraPress,
}: AgentBottomNavigationContentProps) => {
  const { t } = useTranslation()
  const activeIndex = tabs.findIndex(tab => tab === activeTab)
  const restingIndicator = useMotionValue(activeIndex)

  useEffect(() => {
    restingIndicator.set(activeIndex)
  }, [restingIndicator, activeIndex])

  const clampedIndicator = useTransform(indicator ?? restingIndicator, value =>
    Math.min(
      Math.max(value, -indicatorOvershoot),
      tabs.length - 1 + indicatorOvershoot
    )
  )
  const [selectedIndex, setSelectedIndex] = useState(activeIndex)
  useMotionValueEvent(clampedIndicator, 'change', value =>
    setSelectedIndex(Math.round(value))
  )

  const labels: Record<Tab, string> = { wallet: t('wallet'), defi: t('earn') }
  const icons: Record<Tab, ReactNode> = {
    wallet: <StationWalletFilledIcon />,
    defi: <NodesIcon />,
  }

  return (
    <NavContainer data-testid="bottom-navigation">
      <NavSurface $isExtension={isExtension} />
      <TabsRow $isExtension={isExtension} data-testid="bottom-navigation-tabs">
        <TabsTrack>
          {activeIndex === -1 ? null : (
            <BottomNavigationPill
              indicator={clampedIndicator}
              tabCount={tabs.length}
            />
          )}
          {tabs.map((tab, index) => (
            <BottomNavigationTab
              key={tab}
              icon={icons[tab]}
              label={labels[tab]}
              isSelected={index === selectedIndex}
              onClick={() => onTabChange(tab)}
            />
          ))}
        </TabsTrack>
      </TabsRow>
      <FloatingCamera
        $isExtension={isExtension}
        aria-label={t('scan_qr')}
        data-testid="bottom-navigation-scan"
        onClick={onCameraPress}
      >
        <CameraFilledIcon />
      </FloatingCamera>
    </NavContainer>
  )
}

const tabsMaxWidth = 500

const NavContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 30;
  height: ${navHeight}px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 8px 12px 10px 12px;

  @supports (padding-bottom: calc(0px + env(safe-area-inset-bottom))) {
    height: calc(${navHeight}px + env(safe-area-inset-bottom));
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
  }
`

const NavSurface = styled.div<{ $isExtension: boolean }>`
  position: absolute;
  inset: 0;
  z-index: 25;
  pointer-events: none;
  background: ${({ $isExtension, theme }) =>
    $isExtension
      ? 'rgba(19, 46, 86, 0.6)'
      : theme.iconStyle === 'station'
        ? theme.colors.foreground.withAlpha(0.5).toCssValue()
        : theme.colors.foreground.toCssValue()};
  backdrop-filter: blur(32px);
  border-top: 1px solid
    ${({ $isExtension, theme }) =>
      $isExtension
        ? theme.colors.foregroundSuper.toCssValue()
        : theme.colors.foregroundExtra.toCssValue()};
`

const TabsRow = styled.div<{ $isExtension: boolean }>`
  position: relative;
  display: flex;
  z-index: 30;
  width: 100%;
  max-width: ${tabsMaxWidth}px;
  padding-right: ${({ $isExtension }) =>
    $isExtension ? 0 : cameraButtonSize + cameraButtonInset}px;
`

const TabsTrack = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  min-width: 0;
`

const FloatingCamera = styled(UnstyledButton)<{ $isExtension: boolean }>`
  position: ${({ $isExtension }) => ($isExtension ? 'fixed' : 'absolute')};
  right: ${cameraButtonInset}px;
  ${({ $isExtension }) =>
    $isExtension
      ? css`
          bottom: 80px;
        `
      : css`
          top: 5px;
        `}
  z-index: 35;
  ${borderRadius.pill};
  ${centerContent};
  ${sameDimensions(cameraButtonSize)};
  background: ${({ theme }) =>
    theme.iconStyle === 'station'
      ? theme.colors.buttonPrimary.toCssValue()
      : '#4879fd'};
  font-size: 24px;
  color: ${getColor('text')};
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) =>
      theme.iconStyle === 'station'
        ? theme.colors.buttonHover.toCssValue()
        : '#5a8aff'};
  }

  ${({ $isExtension }) =>
    $isExtension &&
    css`
      @supports (bottom: calc(0px + env(safe-area-inset-bottom))) {
        bottom: calc(80px + env(safe-area-inset-bottom));
      }
    `}
`
