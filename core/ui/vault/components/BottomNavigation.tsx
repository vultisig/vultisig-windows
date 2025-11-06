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
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { featureFlags } from '../../featureFlags'

export const bottomNavigationHeight = 75

const Container = styled(UnstyledButton)`
  ${round};
  background: ${getColor('primaryAccentFour')};
  ${centerContent};
  ${sameDimensions(56)};
  font-size: 24px;

  position: relative;
  top: -18px;
`

const Position = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: ${bottomNavigationHeight}px;
  pointer-events: none;

  display: flex;
  align-items: flex-end;
  justify-content: center;
  box-shadow: 0px -60px 80px 10px rgba(2, 18, 43, 0.95);
`

const InnerContainer = styled.div`
  ${hStack({
    gap: 3,
    justifyContent: 'center',
    alignItems: 'center',
  })};

  width: 100%;
  padding: 8px 12px 10px 12px;
  border-top: 1px solid ${getColor('foregroundSuper')};
  background: rgba(19, 46, 86, 0.6);
  backdrop-filter: blur(32px);
  pointer-events: auto;
`

const SecondaryItemWrapper = styled(Button)<IsActiveProp>`
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
`

export const BottomNavigation = () => {
  const navigate = useCoreNavigate()
  const { t } = useTranslation()

  return (
    <Position>
      <InnerContainer>
        <SecondaryItemWrapper>
          <WalletIcon />
          <Text as="span" size={10}>
            {t('wallet')}
          </Text>
        </SecondaryItemWrapper>
        <Container onClick={() => navigate({ id: 'uploadQr', state: {} })}>
          <Camera2Icon />
        </Container>
        {featureFlags.earn && (
          <SecondaryItemWrapper disabled={t('coming_soon')}>
            <CoinsAddIcon />
            <Text as="span" size={10}>
              {t('earn')}
            </Text>
          </SecondaryItemWrapper>
        )}
      </InnerContainer>
    </Position>
  )
}
