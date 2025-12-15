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
import { IsActiveProp, IsDisabledProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

export const bottomNavigationHeight = 62

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
      navigate({ id: 'defi', state: {} })
    }
  }

  return (
    <Position>
      <InnerContainer>
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
  position: relative;
  top: -18px;

  &:hover {
    background: ${getColor('buttonHover')};
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

  height: ${bottomNavigationHeight}px;
`

const InnerContainer = styled.div`
  pointer-events: auto;
  ${hStack({
    gap: 3,
    justifyContent: 'center',
    alignItems: 'center',
  })};
  background: rgba(19, 46, 86, 0.1);
  backdrop-filter: blur(32px);
  padding: 8px 12px 10px 12px;
`

const TabButton = styled(Button)<IsActiveProp & IsDisabledProp>`
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

  ${({ isDisabled }) =>
    isDisabled &&
    css`
      cursor: not-allowed;
      opacity: 0.6;
    `}
`
