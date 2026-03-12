import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { centerContent } from '@lib/ui/css/centerContent'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { AgentIcon } from '@lib/ui/icons/AgentIcon'
import { CameraFilledIcon } from '@lib/ui/icons/CameraFilledIcon'
import { CoinsAddIcon } from '@lib/ui/icons/CoinsAddIcon'
import { WalletIcon } from '@lib/ui/icons/WalletIcon'
import { vStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

const navHeight = 66
const cameraButtonSize = 56

type AgentBottomNavigationContentProps = {
  activeTab?: 'wallet' | 'defi' | 'agent'
  onTabChange: (tab: 'wallet' | 'defi' | 'agent') => void
  onCameraPress: () => void
}

export const AgentBottomNavigationContent = ({
  activeTab = 'wallet',
  onTabChange,
  onCameraPress,
}: AgentBottomNavigationContentProps) => {
  const { t } = useTranslation()

  return (
    <NavContainer>
      <FloatingCamera onClick={onCameraPress}>
        <CameraFilledIcon />
      </FloatingCamera>
      <TabsRow>
        <TabButton
          isActive={activeTab === 'wallet'}
          onClick={() => onTabChange('wallet')}
        >
          <WalletIcon />
          <Text as="span" size={10}>
            {t('wallet')}
          </Text>
        </TabButton>
        <TabButton
          isActive={activeTab === 'defi'}
          onClick={() => onTabChange('defi')}
        >
          <CoinsAddIcon />
          <Text as="span" size={10}>
            {t('defi')}
          </Text>
        </TabButton>
        <TabButton
          isActive={activeTab === 'agent'}
          onClick={() => onTabChange('agent')}
        >
          <AgentIcon />
          <Text as="span" size={10}>
            {t('agent')}
          </Text>
        </TabButton>
      </TabsRow>
    </NavContainer>
  )
}

const tabsMaxWidth = 500

const NavContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${navHeight}px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  background: rgba(19, 46, 86, 0.6);
  backdrop-filter: blur(32px);
  padding: 8px 12px 10px 12px;
  border-top: 1px solid ${getColor('foregroundSuper')};

  @supports (padding-bottom: calc(0px + env(safe-area-inset-bottom))) {
    height: calc(${navHeight}px + env(safe-area-inset-bottom));
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
  }
`

const TabsRow = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  max-width: ${tabsMaxWidth}px;
`

const FloatingCamera = styled(UnstyledButton)`
  position: absolute;
  right: 28px;
  bottom: calc(100% + 14px);
  ${round};
  ${centerContent};
  ${sameDimensions(cameraButtonSize)};
  background: #4879fd;
  font-size: 24px;
  color: ${getColor('text')};
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.2s;

  &:hover {
    background: #5a8aff;
  }
`

type TabButtonProps = {
  isActive?: boolean
}

const TabButton = styled(UnstyledButton)<TabButtonProps>`
  flex: 1 1 0;
  min-width: 0;
  height: 48px;
  padding: 3px 20px;
  font-size: 24px;
  border-radius: 99px;
  transition: all 0.2s ease-in-out;
  background: transparent;

  ${vStack({
    gap: 2,
    justifyContent: 'center',
    alignItems: 'center',
  })};

  ${({ isActive }) =>
    isActive
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
