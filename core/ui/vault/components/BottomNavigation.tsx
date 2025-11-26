import { featureFlags } from '@core/ui/featureFlags'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { centerContent } from '@lib/ui/css/centerContent'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { Camera2Icon } from '@lib/ui/icons/Camera2Icon'
import { CoinsAddIcon } from '@lib/ui/icons/CoinsAddIcon'
import { WalletIcon } from '@lib/ui/icons/WalletIcon'
import { hStack, vStack } from '@lib/ui/layout/Stack'
import { IsActiveProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

export const bottomNavigationHeight = 75
export const mobileBottomNavigationHeight = 120

type BottomNavigationProps = {
  activeTab?: 'wallet' | 'defi'
}

export const BottomNavigation = ({
  activeTab = 'wallet',
}: BottomNavigationProps) => {
  const navigate = useCoreNavigate()
  const { t } = useTranslation()

  const handleTabChange = (tab: 'wallet' | 'defi') => {
    if (tab === 'wallet') {
      navigate({ id: 'vault' })
    } else {
      navigate({ id: 'defi' })
    }
  }

  return (
    <Position>
      <InnerContainer>
        {/* Mobile Layout */}
        <MobileRow>
          {featureFlags.defi ? (
            <SwitchContainer>
              <SwitchButton
                isActive={activeTab === 'wallet'}
                onClick={() => handleTabChange('wallet')}
              >
                <WalletIcon />
                {t('wallet')}
              </SwitchButton>
              <SwitchButton
                isActive={activeTab === 'defi'}
                onClick={() => handleTabChange('defi')}
              >
                <CoinsAddIcon />
                {t('defi')}
              </SwitchButton>
            </SwitchContainer>
          ) : null}
          <CameraButton onClick={() => navigate({ id: 'uploadQr', state: {} })}>
            <Camera2Icon />
          </CameraButton>
        </MobileRow>

        {/* Desktop Layout */}
        {featureFlags.defi && (
          <SecondaryItemWrapper
            isActive={activeTab === 'wallet'}
            onClick={() => handleTabChange('wallet')}
          >
            <WalletIcon />
            <Text as="span" size={10}>
              {t('wallet')}
            </Text>
          </SecondaryItemWrapper>
        )}
        <DesktopCameraButton
          onClick={() => navigate({ id: 'uploadQr', state: {} })}
        >
          <Camera2Icon />
        </DesktopCameraButton>
        {featureFlags.defi && (
          <SecondaryItemWrapper
            isActive={activeTab === 'defi'}
            onClick={() => handleTabChange('defi')}
          >
            <CoinsAddIcon />
            <Text as="span" size={10}>
              {t('defi')}
            </Text>
          </SecondaryItemWrapper>
        )}
      </InnerContainer>
    </Position>
  )
}

const CameraButton = styled(UnstyledButton)`
  ${round};
  background: ${getColor('buttonPrimary')};
  ${centerContent};
  ${sameDimensions(56)};
  font-size: 24px;
  color: ${getColor('text')};
  transition: all 0.2s;
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.2),
    inset 0 2px 2px rgba(0, 0, 0, 0.2);

  &:hover {
    background: ${getColor('buttonHover')};
  }
`

const DesktopCameraButton = styled(CameraButton)`
  display: none;

  @media ${mediaQuery.tabletDeviceAndUp} {
    display: flex;
    position: relative;
    top: -18px;
  }
`

const Position = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  pointer-events: none;

  display: flex;
  align-items: flex-end;
  justify-content: center;
  box-shadow: 0px -60px 80px 10px rgba(2, 18, 43, 0.95);

  height: ${mobileBottomNavigationHeight}px;

  @media ${mediaQuery.tabletDeviceAndUp} {
    height: ${bottomNavigationHeight}px;
  }
`

const InnerContainer = styled.div`
  width: 100%;
  border-top: 1px solid ${getColor('foregroundSuper')};
  background: ${getColor('background')};
  pointer-events: auto;
  padding-inline: 16px;
  display: flex;
  flex-direction: column;
  height: ${mobileBottomNavigationHeight}px;
  justify-content: center;
  align-items: center;
  gap: 16px;

  @media ${mediaQuery.tabletDeviceAndUp} {
    ${hStack({
      gap: 3,
      justifyContent: 'center',
      alignItems: 'center',
    })};
    background: rgba(19, 46, 86, 0.1);
    backdrop-filter: blur(32px);

    height: auto;
    padding: 8px 12px 10px 12px;
  }
`

const SecondaryItemWrapper = styled(Button)<IsActiveProp>`
  display: none;

  @media ${mediaQuery.tabletDeviceAndUp} {
    display: flex;
    flex-basis: 137px;
    height: 48px;
    padding: 3px 20px;
    font-size: 24px;
    border-radius: 99px;
    transition: background 0.2s ease-in-out;
    background: none;

    ${vStack({
      gap: 2,
      justifyContent: 'center',
      alignItems: 'center',
    })};

    ${({ isActive }) =>
      isActive &&
      css`
        &:hover {
          background: ${getColor('primaryAccentFour')};
        }
      `}
  }
`

const MobileRow = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  gap: 16px;

  @media ${mediaQuery.tabletDeviceAndUp} {
    display: none;
  }
`

const SwitchContainer = styled.div`
  display: flex;
  min-height: 54px;
  width: 202px;
  background:
    linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.white.withAlpha(0.02).toCssValue()} 0%,
      ${({ theme }) => theme.colors.white.withAlpha(0.06).toCssValue()} 100%
    ),
    linear-gradient(0deg, #0d1f35 0%, #0d1f35 100%),
    ${({ theme }) => theme.colors.white.withAlpha(0.3).toCssValue()};
  background-blend-mode: normal, normal, color-burn;
  border-radius: 1000px;
  padding: 4px;
  position: relative;

  box-shadow:
    inset 0 1px 1px
      ${({ theme }) => theme.colors.white.withAlpha(0.15).toCssValue()},
    inset 0 -1px 1px
      ${({ theme }) => theme.colors.background.withAlpha(0.3).toCssValue()};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 1000px;
    padding: 1px;
    background: conic-gradient(
      from 0deg,
      ${({ theme }) => theme.colors.white.withAlpha(0.35).toCssValue()} 0deg,
      ${({ theme }) => theme.colors.white.withAlpha(0.05).toCssValue()} 20deg,
      ${({ theme }) => theme.colors.white.withAlpha(0.05).toCssValue()} 90deg,
      ${({ theme }) => theme.colors.white.withAlpha(0.35).toCssValue()} 145deg,
      ${({ theme }) => theme.colors.white.withAlpha(0.05).toCssValue()} 200deg,
      ${({ theme }) => theme.colors.white.withAlpha(0.05).toCssValue()} 270deg,
      ${({ theme }) => theme.colors.white.withAlpha(0.35).toCssValue()} 325deg,
      ${({ theme }) => theme.colors.white.withAlpha(0.35).toCssValue()} 360deg
    );
    -webkit-mask:
      linear-gradient(${({ theme }) => theme.colors.white.toCssValue()} 0 0)
        content-box,
      linear-gradient(${({ theme }) => theme.colors.white.toCssValue()} 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
`

const SwitchButton = styled(UnstyledButton)<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 20px;
  border-radius: 1000px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ isActive }) => getColor(isActive ? 'contrast' : 'textShy')};
  background: ${({ isActive }) =>
    isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent'};
  transition: all 0.2s;
  position: relative;
  z-index: 1;

  ${({ isActive }) =>
    isActive &&
    css`
      box-shadow:
        inset 0 1px 2px rgba(255, 255, 255, 0.2),
        inset 0 -1px 2px rgba(0, 0, 0, 0.2);
    `}

  &:hover {
    background: ${({ isActive }) =>
      isActive ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
  }

  svg {
    font-size: 20px;
  }
`
