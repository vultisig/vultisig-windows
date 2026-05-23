import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { vStack } from '@lib/ui/layout/Stack'
import { text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

const btcImageUrl = '/core/images/qbtc-claim-banner-btc.png'

export const BannerRoot = styled.div`
  ${vStack({ gap: 16, justifyContent: 'center', alignItems: 'stretch' })};

  position: relative;
  width: 100%;
  min-height: 156px;
  box-sizing: border-box;
  padding: 24px;
  border-radius: 12px;
  background: ${getColor('foregroundExtra')};
  border: 1px solid ${getColor('foregroundExtra')};
  overflow: hidden;
`

export const BannerEllipseOuter = styled.div`
  position: absolute;
  top: -131px;
  left: 50%;
  width: 418px;
  height: 418px;
  margin-left: -209px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.02);
  opacity: 0.7;
  pointer-events: none;
  z-index: 0;
`

export const BannerEllipseGlass = styled.div`
  position: absolute;
  top: -69px;
  left: 50%;
  width: 294px;
  height: 294px;
  margin-left: -147px;
  border-radius: 50%;
  background: ${getColor('background')};
  border: 2px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(94px);
  opacity: 0.7;
  pointer-events: none;
  z-index: 0;
`

export const BannerEllipseGlow = styled.div`
  position: absolute;
  top: -59px;
  left: 50%;
  width: 350px;
  height: 350px;
  margin-left: -175px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(4, 57, 199, 1) 0%,
    rgba(2, 18, 43, 0) 100%
  );
  filter: blur(74px);
  opacity: 0.7;
  pointer-events: none;
  z-index: 0;
`

const BtcSticker = styled.div`
  position: absolute;
  background-image: url('${btcImageUrl}');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  pointer-events: none;
  z-index: 1;
`

export const BtcStickerTopRight = styled(BtcSticker)`
  top: -22px;
  right: -15px;
  width: 87px;
  height: 98px;
`

export const BtcStickerMidRight = styled(BtcSticker)`
  top: 96px;
  right: 4px;
  width: 48px;
  height: 53px;
`

export const BtcStickerTopLeft = styled(BtcSticker)`
  top: 0;
  left: -1px;
  width: 52px;
  height: 54px;
`

export const BtcStickerBottomLeft = styled(BtcSticker)`
  top: 122px;
  left: -1px;
  width: 51px;
  height: 55px;
`

export const BtcStickerMidLeft = styled(BtcSticker)`
  top: 36px;
  left: -37px;
  width: 98px;
  height: 106px;
`

export const BannerTextStack = styled.div`
  ${vStack({ gap: 8 })};

  position: relative;
  z-index: 2;
  align-self: stretch;
  text-align: center;
`

export const BannerCta = styled(UnstyledButton)`
  ${text({
    size: 12,
    weight: 500,
    height: 16 / 12,
  })};

  position: relative;
  z-index: 2;
  align-self: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 30px;
  background: ${getColor('buttonPrimary')};
  color: ${getColor('text')};
  white-space: nowrap;
  box-shadow:
    inset 0 -1px 0.5px 0 #0f1c3e,
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.1);
  transition:
    transform 0.2s,
    opacity 0.2s;

  &:hover {
    transform: scale(1.02);
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }
`
