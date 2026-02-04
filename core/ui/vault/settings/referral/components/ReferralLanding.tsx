import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { VStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { GradientText, Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const ReferralLanding = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()

  return (
    <>
      <Overlay />
      <Wrapper gap={24} justifyContent="flex-end">
        <ImageWrapper justifyContent="flex-end">
          <PositionedImage src="/core/images/referrals-landing.png" alt="" />
        </ImageWrapper>
        <Text size={22} centerHorizontally>
          <Trans
            i18nKey="referral_landing_title"
            components={{ g: <GradientText as="span" size={22} /> }}
          />
        </Text>
        <Text color="shyExtra" size={14} centerHorizontally>
          {t('share_description')}
        </Text>
        <ButtonWrapper>
          <Button onClick={onFinish}>{t('get_started')}</Button>
        </ButtonWrapper>
      </Wrapper>
    </>
  )
}

const Wrapper = styled(VStack)`
  background-color: ${getColor('foregroundExtra')};
  ${borderRadius.m}
  bottom: 0;
  height: 500px;
  left: 0;
  overflow: hidden;
  padding: 0 36px 36px 36px;
  position: fixed;

  @media (${mediaQuery.tabletDeviceAndUp}) {
    height: 380px;
    left: 50%;
    max-width: 580px;
    top: 50%;
    transform: translate(-50%, -50%);
    width: calc(100vw - 32px);
  }
`

const Overlay = styled.div`
  background-color: rgba(2, 18, 43, 0.9);
  box-shadow:
    0px -1px 4px 0px rgba(255, 255, 255, 0.2) inset,
    -2px 0px 5px -3px rgba(255, 255, 255, 0.4) inset;
  inset: 0;
  position: fixed;
  z-index: 0;
`

const PositionedImage = styled.img`
  border-radius: 12px;
`

const ImageWrapper = styled(VStack)`
  border-radius: 34px;
  box-shadow:
    0px -1px 4px 0px rgba(255, 255, 255, 0.2) inset,
    -2px 0px 5px -3px rgba(255, 255, 255, 0.4) inset;
  height: 400px;
  left: 50%;
  opacity: 0.75;
  padding: 0px 12px 16px 12px;
  position: relative;
  transform: translateX(-50%);
  width: 214px;

  &::before {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 34px;
    content: '';
    height: 100%;
    left: 0;
    pointer-events: none;
    position: absolute;
    top: 0;
    width: 100%;
  }
`

const ButtonWrapper = styled(VStack)`
  align-self: center;

  ${mediaQuery.tabletDeviceAndUp} {
    align-self: stretch;
  }
`
