import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { CameraFilledIcon } from '@lib/ui/icons/CameraFilledIcon'
import { NodesIcon } from '@lib/ui/icons/NodesIcon'
import { StationWalletFilledIcon } from '@lib/ui/icons/StationFigmaIcons'
import { vStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

const navHeight = 66
const cameraButtonSize = 56
const cameraButtonInset = 28

type AgentBottomNavigationContentProps = {
  activeTab?: 'wallet' | 'defi' | 'agent'
  isExtension?: boolean
  onTabChange: (tab: 'wallet' | 'defi') => void
  onCameraPress: () => void
}

export const AgentBottomNavigationContent = ({
  activeTab = 'wallet',
  isExtension = false,
  onTabChange,
  onCameraPress,
}: AgentBottomNavigationContentProps) => {
  const { t } = useTranslation()

  return (
    <NavContainer data-testid="bottom-navigation">
      <NavSurface $isExtension={isExtension} />
      <TabsRow $isExtension={isExtension} data-testid="bottom-navigation-tabs">
        <TabButton
          $isActive={activeTab === 'wallet'}
          onClick={() => onTabChange('wallet')}
        >
          <StationWalletFilledIcon />
          <Text as="span" size={10}>
            {t('wallet')}
          </Text>
        </TabButton>
        <TabButton
          $isActive={activeTab === 'defi'}
          onClick={() => onTabChange('defi')}
        >
          <NodesIcon />
          <Text as="span" size={10}>
            {t('earn')}
          </Text>
        </TabButton>
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

const FloatingCamera = styled(UnstyledButton)<{ $isExtension: boolean }>`
  position: ${({ $isExtension }) => ($isExtension ? 'fixed' : 'absolute')};
  right: ${({ $isExtension }) =>
    $isExtension ? 'auto' : `${cameraButtonInset}px`};
  left: ${({ $isExtension }) => ($isExtension ? '50%' : 'auto')};
  transform: ${({ $isExtension }) =>
    $isExtension ? 'translateX(-50%)' : 'none'};
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

type TabButtonProps = {
  $isActive?: boolean
}

const TabButton = styled(UnstyledButton)<TabButtonProps>`
  flex: 1 1 0;
  min-width: 0;
  height: 48px;
  padding: 3px 20px;
  font-size: 24px;
  ${borderRadius.pill};
  transition: all 0.2s ease-in-out;
  background: transparent;

  ${vStack({
    gap: 2,
    justifyContent: 'center',
    alignItems: 'center',
  })};

  ${({ $isActive }) =>
    $isActive
      ? css`
          color: ${getColor('contrast')};
        `
      : css`
          color: ${getColor('textShy')};
        `}

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`
