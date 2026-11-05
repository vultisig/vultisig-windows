import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { SettingsHugCtaButton } from '@core/ui/settings/SettingsCtaButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { VStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { GradientText } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

/** First-visit referral sheet: the pitch over a phone preview. */
export const ReferralLanding = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()

  return (
    <>
      <Overlay />
      <Wrapper gap={24} justifyContent="flex-end">
        <ImageWrapper justifyContent="flex-end">
          <PositionedImage src="/core/images/referrals-landing.png" alt="" />
        </ImageWrapper>
        <VStack gap={12}>
          <SettingsBaselineText centerHorizontally variant="title2">
            <Trans
              i18nKey="referral_landing_title"
              components={{ g: <GradientText as="span" size={22} /> }}
            />
          </SettingsBaselineText>
          <Description
            centerHorizontally
            color="shyExtra"
            height={20 / 14}
            size={14}
            weight={500}
          >
            {t('share_description')}
          </Description>
        </VStack>
        <ButtonWrapper>
          <StartButton onClick={onFinish}>{t('get_started')}</StartButton>
        </ButtonWrapper>
      </Wrapper>
    </>
  )
}

const Wrapper = styled(VStack)`
  ${borderRadius.xl};
  background-color: ${getColor('foregroundExtra')};
  bottom: 16px;
  height: 484px;
  left: 16px;
  overflow: hidden;
  padding: 0 36px 36px 36px;
  position: fixed;
  right: 16px;

  @media (${mediaQuery.tabletDeviceAndUp}) {
    bottom: auto;
    height: 484px;
    left: 50%;
    max-width: 580px;
    right: auto;
    top: 50%;
    transform: translate(-50%, -50%);
    width: calc(100vw - 32px);
  }
`

const Overlay = styled.div`
  backdrop-filter: blur(12px);
  background-color: rgba(0, 0, 0, 0.7);
  inset: 0;
  pointer-events: none;
  position: fixed;
  z-index: 0;
`

const Description = styled(SettingsBaselineText)`
  margin-inline: auto;
  max-width: 245px;
`

const StartButton = styled(SettingsHugCtaButton)`
  font-weight: 500;
  padding-top: 4px;
`

const PositionedImage = styled.img`
  ${borderRadius.md};
`

const ImageWrapper = styled(VStack)`
  ${borderRadius.xl};
  box-shadow:
    0px -1px 4px 0px rgba(255, 255, 255, 0.2) inset,
    -2px 0px 5px -3px rgba(255, 255, 255, 0.4) inset;
  flex-shrink: 0;
  height: 400px;
  left: 50%;
  padding: 0px 11px 12px 11px;
  position: relative;
  transform: translateX(-50%);
  width: 236px;

  &::before {
    background: linear-gradient(
      ${({ theme }) => theme.colors.background.withAlpha(0.5).toCssValue()},
      transparent
    );
    bottom: 0;
    content: '';
    height: 194px;
    left: 0;
    pointer-events: none;
    position: absolute;
    width: 100%;
  }
`

const ButtonWrapper = styled(VStack)`
  align-self: center;

  ${mediaQuery.tabletDeviceAndUp} {
    align-self: stretch;
  }
`
