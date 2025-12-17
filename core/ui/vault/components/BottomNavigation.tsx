import { featureFlags } from '@core/ui/featureFlags'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { centerContent } from '@lib/ui/css/centerContent'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { Camera2Icon } from '@lib/ui/icons/Camera2Icon'
import { CoinsAddIcon } from '@lib/ui/icons/CoinsAddIcon'
import { WalletIcon } from '@lib/ui/icons/WalletIcon'
import { hStack, vStack } from '@lib/ui/layout/Stack'
import { pageBottomInsetVar } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

export const bottomNavigationHeight = 66
const cameraIconSize = 56

export const bottomNavigationInset = css`
  ${pageBottomInsetVar}: ${bottomNavigationHeight}px;
`

type BottomNavigationProps = {
  activeTab?: 'wallet' | 'defi'
}

export const BottomNavigation = ({
  activeTab = 'wallet',
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

  const handleTabChange = (tab: 'wallet' | 'defi') => {
    if (tab === 'wallet') {
      navigate({ id: 'vault' })
    } else {
      navigate({ id: 'defi', state: {} })
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
      <CameraButton onClick={() => navigate({ id: 'uploadQr', state: {} })}>
        <Camera2Icon />
      </CameraButton>
      {featureFlags.defiEnabled ? (
        <TabButton
          isActive={activeTab === 'defi'}
          onClick={() => handleTabChange('defi')}
        >
          <CoinsAddIcon />
          <Text as="span" size={10}>
            {t('defi')}
          </Text>
        </TabButton>
      ) : (
        <Tooltip
          content={t('coming_soon')}
          placement="top"
          renderOpener={props => (
            <TabButton {...props} isActive={activeTab === 'defi'} isDisabled>
              <CoinsAddIcon />
              <Text as="span" size={10}>
                {t('defi')}
              </Text>
            </TabButton>
          )}
        />
      )}
    </Container>
  )
}

const Container = styled.div`
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
`

const CameraButton = styled(UnstyledButton)`
  ${round};
  background: #4879fd;
  ${centerContent};
  ${sameDimensions(cameraIconSize)};
  font-size: 24px;
  color: ${getColor('text')};
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 12px;

  &:hover {
    background: #5a8aff;
  }
`

type TabButtonProps = {
  isActive?: boolean
  isDisabled?: boolean
}

const TabButton = styled(UnstyledButton)<TabButtonProps>`
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
