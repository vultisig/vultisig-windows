import { featureFlags } from '@core/ui/featureFlags'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { centerContent } from '@lib/ui/css/centerContent'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { CameraIcon } from '@lib/ui/icons/CameraIcon'
import { CoinsAddIcon } from '@lib/ui/icons/CoinsAddIcon'
import { SparklesIcon } from '@lib/ui/icons/SparklesIcon'
import { WalletIcon } from '@lib/ui/icons/WalletIcon'
import { hStack, vStack } from '@lib/ui/layout/Stack'
import { pageBottomInsetVar } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

const bottomNavigationHeight = 66
const centerButtonSize = 56

type BottomNavigationProps = {
  activeTab?: 'wallet' | 'defi' | 'agent'
  isActiveTabRoot?: boolean
}

export const BottomNavigation = ({
  activeTab = 'wallet',
  isActiveTabRoot = true,
}: BottomNavigationProps) => {
  const navigate = useCoreNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    const previousValue = root.style.getPropertyValue(pageBottomInsetVar)

    root.style.setProperty(pageBottomInsetVar, `${bottomNavigationHeight}px`)

    return () => {
      if (previousValue) {
        root.style.setProperty(pageBottomInsetVar, previousValue)
      } else {
        root.style.removeProperty(pageBottomInsetVar)
      }
    }
  }, [])

  if (!featureFlags.agent) {
    const handleTabChangeOld = (tab: 'wallet' | 'defi') => {
      if (tab === activeTab && isActiveTabRoot) return
      if (tab === 'wallet') {
        navigate({ id: 'vault' }, { replace: true })
      } else {
        navigate({ id: 'defi', state: {} }, { replace: true })
      }
    }
    return (
      <ContainerOld>
        <TabButtonOld
          isActive={activeTab === 'wallet'}
          onClick={() => handleTabChangeOld('wallet')}
        >
          <WalletIcon />
          <Text as="span" size={10}>
            {t('wallet')}
          </Text>
        </TabButtonOld>
        <CameraButton onClick={() => navigate({ id: 'uploadQr', state: {} })}>
          <CameraIcon />
        </CameraButton>
        <TabButtonOld
          isActive={activeTab === 'defi'}
          onClick={() => handleTabChangeOld('defi')}
        >
          <CoinsAddIcon />
          <Text as="span" size={10}>
            {t('defi')}
          </Text>
        </TabButtonOld>
      </ContainerOld>
    )
  }

  const handleTabChange = (tab: 'wallet' | 'defi' | 'agent') => {
    if (tab === activeTab && isActiveTabRoot) return

    if (tab === 'wallet') {
      navigate({ id: 'vault' }, { replace: true })
    } else if (tab === 'defi') {
      navigate({ id: 'defi', state: {} }, { replace: true })
    } else if (tab === 'agent') {
      navigate({ id: 'agent' }, { replace: true })
    }
  }

  return (
    <Container>
      <TabButton
        isActive={activeTab === 'wallet'}
        onClick={() => handleTabChange('wallet')}
      >
        <WalletIcon />
        <Text as="span" size={10}>
          {t('wallet')}
        </Text>
      </TabButton>
      <TabButton
        isActive={activeTab === 'defi'}
        onClick={() => handleTabChange('defi')}
      >
        <CoinsAddIcon />
        <Text as="span" size={10}>
          {t('defi')}
        </Text>
      </TabButton>
      <CenterButton
        isActive={activeTab === 'agent'}
        onClick={() => handleTabChange('agent')}
      >
        <SparklesIcon />
      </CenterButton>
      <TabButton onClick={() => navigate({ id: 'uploadQr', state: {} })}>
        <CameraIcon />
        <Text as="span" size={10}>
          {t('scan_qr')}
        </Text>
      </TabButton>
    </Container>
  )
}

const Container = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${bottomNavigationHeight}px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  background: rgba(19, 46, 86, 0.6);
  backdrop-filter: blur(32px);
  padding: 8px 12px 10px 12px;
  border-top: 1px solid ${getColor('foregroundSuper')};

  @supports (padding-bottom: calc(0px + env(safe-area-inset-bottom))) {
    height: calc(${bottomNavigationHeight}px + env(safe-area-inset-bottom));
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
  }
`

type CenterButtonProps = {
  isActive?: boolean
}

const CenterButton = styled(UnstyledButton)<CenterButtonProps>`
  flex-shrink: 0;
  ${round};
  background: ${({ isActive, theme }) =>
    isActive
      ? `linear-gradient(135deg, ${theme.colors.primary.toCssValue()} 0%, ${theme.colors.primaryAccentTwo.toCssValue()} 100%)`
      : theme.colors.primaryAccentFour.toCssValue()};
  ${centerContent};
  ${sameDimensions(centerButtonSize)};
  font-size: 24px;
  color: ${getColor('text')};
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 12px;

  &:hover {
    background: ${({ isActive, theme }) =>
      isActive
        ? `linear-gradient(135deg, ${theme.colors.primary.toCssValue()} 0%, ${theme.colors.primaryAccentTwo.toCssValue()} 100%)`
        : theme.colors.buttonHover.toCssValue()};
  }
`

type TabButtonProps = {
  isActive?: boolean
  isDisabled?: boolean
}

const TabButton = styled(UnstyledButton)<TabButtonProps>`
  flex: 1 1 0;
  min-width: 0;
  width: 100px;
  height: 48px;
  padding: 3px 12px;
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

  ${({ isDisabled }) =>
    isDisabled &&
    css`
      cursor: not-allowed;
      opacity: 0.6;
    `}

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`

const ContainerOld = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${bottomNavigationHeight}px;
  ${hStack({
    justifyContent: 'center',
    alignItems: 'flex-end',
  })};
  background: rgba(19, 46, 86, 0.6);
  backdrop-filter: blur(32px);
  padding: 8px 12px 10px 12px;
  border-top: 1px solid #1b3f73;

  @supports (padding-bottom: calc(0px + env(safe-area-inset-bottom))) {
    height: calc(${bottomNavigationHeight}px + env(safe-area-inset-bottom));
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
  }
`

const CameraButton = styled(UnstyledButton)`
  ${round};
  background: #4879fd;
  ${centerContent};
  ${sameDimensions(centerButtonSize)};
  font-size: 24px;
  color: ${getColor('text')};
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 12px;

  &:hover {
    background: #5a8aff;
  }
`

type TabButtonOldProps = {
  isActive?: boolean
  isDisabled?: boolean
}

const TabButtonOld = styled(UnstyledButton)<TabButtonOldProps>`
  width: 137px;
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

  ${({ isDisabled }) =>
    isDisabled &&
    css`
      cursor: not-allowed;
      opacity: 0.6;
    `}

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`
