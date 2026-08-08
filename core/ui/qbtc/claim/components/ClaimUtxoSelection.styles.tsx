import { vStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

const coinIconUrl = '/core/images/qbtc-claim-card-coin.svg'

export const HeaderCard = styled.div`
  ${vStack({ gap: 6, justifyContent: 'center' })};

  position: relative;
  align-self: stretch;
  min-height: 118px;
  box-sizing: border-box;
  padding: 16px;
  border-radius: 16px;
  background: linear-gradient(
    180deg,
    rgba(95, 191, 255, 0.18) 0%,
    rgba(95, 191, 255, 0) 100%
  );
  border: 1px solid rgba(176, 144, 245, 0.17);
  overflow: hidden;
`

export const HeaderCardCoin = styled.div`
  position: absolute;
  top: -16px;
  right: -24px;
  width: 200px;
  height: 206px;
  background-image: url('${coinIconUrl}');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  opacity: 0.6;
  pointer-events: none;
`

export const HeaderCardContent = styled.div`
  ${vStack({ gap: 6 })};
  position: relative;
  z-index: 1;
`

export const HeaderCardAmount = styled.span`
  font-family: Satoshi, sans-serif;
  font-size: 28px;
  font-weight: 500;
  line-height: 34px;
  letter-spacing: -0.56px;
`

export const TabStrip = styled.div`
  display: flex;
  align-items: center;
  align-self: stretch;
  gap: 20px;
`

export const ActiveTabItem = styled.div`
  padding-top: 2px;
  padding-bottom: 6px;
  border-bottom: 1.5px solid ${getColor('buttonPrimary')};
`
