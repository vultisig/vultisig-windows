import {
  useDismissBanner,
  useDismissedBanners,
} from '@core/ui/storage/dismissedBanners'
import { autoUpdate, offset, shift, useFloating } from '@floating-ui/react'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { Coachmark } from '@lib/ui/coachmark/Coachmark'
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
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

const navHeight = 66
const cameraButtonSize = 56
const agentNavigationCoachmarkId = 'agentNavigationCoachmark'

type AgentBottomNavigationContentProps = {
  activeTab?: 'wallet' | 'defi' | 'agent'
  showAgentCoachmark?: boolean
  onTabChange: (tab: 'wallet' | 'defi' | 'agent') => void
  onCameraPress: () => void
}

export const AgentBottomNavigationContent = ({
  activeTab = 'wallet',
  showAgentCoachmark = false,
  onTabChange,
  onCameraPress,
}: AgentBottomNavigationContentProps) => {
  const { t } = useTranslation()
  const dismissBanner = useDismissBanner()
  const { hasLoaded, isBannerDismissed } = useDismissedBanners()
  const [isCoachmarkOpen, setIsCoachmarkOpen] = useState(false)

  const shouldShowCoachmark =
    showAgentCoachmark &&
    activeTab !== 'agent' &&
    hasLoaded &&
    !isBannerDismissed(agentNavigationCoachmarkId)

  async function closeCoachmark() {
    setIsCoachmarkOpen(false)
    await dismissBanner(agentNavigationCoachmarkId)
  }

  const { refs, floatingStyles } = useFloating({
    open: isCoachmarkOpen,
    placement: 'top',
    strategy: 'fixed',
    middleware: [
      offset({ mainAxis: 22, crossAxis: -63 }),
      shift({ padding: 12 }),
    ],
    whileElementsMounted: autoUpdate,
  })

  useEffect(() => {
    setIsCoachmarkOpen(shouldShowCoachmark)
  }, [shouldShowCoachmark])

  useEffect(() => {
    if (!isCoachmarkOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCoachmarkOpen(false)
        void dismissBanner(agentNavigationCoachmarkId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [dismissBanner, isCoachmarkOpen])

  useEffect(() => {
    if (!isCoachmarkOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node)) return

      const referenceElement = refs.reference.current
      const floatingElement = refs.floating.current

      const isReferenceTarget =
        referenceElement instanceof Element && referenceElement.contains(target)
      const isFloatingTarget =
        floatingElement instanceof Element && floatingElement.contains(target)

      if (isReferenceTarget || isFloatingTarget) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      setIsCoachmarkOpen(false)
      void dismissBanner(agentNavigationCoachmarkId)
    }

    document.addEventListener('pointerdown', handlePointerDown, true)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
    }
  }, [dismissBanner, isCoachmarkOpen, refs.floating, refs.reference])

  return (
    <>
      {isCoachmarkOpen && <ContentOverlay />}
      <FloatingCamera onClick={onCameraPress}>
        <CameraFilledIcon />
      </FloatingCamera>
      <NavContainer>
        <NavSurface />
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
            ref={refs.setReference}
            isActive={activeTab === 'agent'}
            onClick={() => {
              if (isCoachmarkOpen) {
                void closeCoachmark()
              }

              onTabChange('agent')
            }}
          >
            <AgentIcon />
            <Text as="span" size={10}>
              {t('agent')}
            </Text>
          </TabButton>
        </TabsRow>
        {isCoachmarkOpen && (
          <CoachmarkContainer
            ref={refs.setFloating}
            style={floatingStyles}
            onClick={event => event.stopPropagation()}
          >
            <Coachmark
              title={t('agent_nav_tip_title')}
              description={t('agent_nav_tip_description')}
              onClose={() => void closeCoachmark()}
            />
          </CoachmarkContainer>
        )}
      </NavContainer>
    </>
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

const ContentOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 18;
  pointer-events: none;
  backdrop-filter: blur(6px);
  background: ${({ theme }) =>
    theme.colors.overlay.withAlpha(0.4).toCssValue()};
`

const NavSurface = styled.div`
  position: absolute;
  inset: 0;
  z-index: 25;
  pointer-events: none;
  background: rgba(19, 46, 86, 0.6);
  backdrop-filter: blur(32px);
  border-top: 1px solid ${getColor('foregroundSuper')};
`

const TabsRow = styled.div`
  position: relative;
  display: flex;
  z-index: 30;
  width: 100%;
  max-width: ${tabsMaxWidth}px;
`

const FloatingCamera = styled(UnstyledButton)`
  position: fixed;
  right: 28px;
  bottom: 80px;
  z-index: 16;
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

  @supports (bottom: calc(0px + env(safe-area-inset-bottom))) {
    bottom: calc(80px + env(safe-area-inset-bottom));
  }
`

const CoachmarkContainer = styled.div`
  z-index: 40;
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
