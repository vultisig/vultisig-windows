import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { VStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { GradientText, Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const ReferralLanding = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()

  //TODO: translations
  return (
    <>
      <Overlay />
      <Wrapper gap={24} flexGrow justifyContent="flex-end">
        <ImageWrapper justifyContent="flex-end">
          <PositionedImage src="/core/images/referrals_landing.svg" alt="" />
        </ImageWrapper>
        <ContentWrapper gap={24}>
          <VStack gap={12}>
            <Text centerHorizontally size={22}>
              Invite friends.{' '}
              <GradientText as="span" size={22}>
                Earn rewards
              </GradientText>
              . Save on fees.
            </Text>
            <Text centerHorizontally>
              Share your unique referral code to invite friends. They get a
              discount and the more they trade, the more you earn — directly to
              your wallet.
            </Text>
          </VStack>
          <ButtonWrapper>
            <Button onClick={onFinish}>{t('next')}</Button>
          </ButtonWrapper>
        </ContentWrapper>
      </Wrapper>
    </>
  )
}

const Wrapper = styled(VStack)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: calc(100vw - 32px);
  padding: 0 36px 36px 36px;
  min-height: 460px;
  background-color: ${getColor('foregroundExtra')};
  ${borderRadius.m}
  overflow: hidden;

  @media (${mediaQuery.tabletDeviceAndUp}) {
    max-width: 580px;
    height: 500px;
    margin-inline: auto;
    left: 50%;
    transform: translate(-50%, -50%);
    flex-grow: 0;
  }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(2, 18, 43, 0.9);
  z-index: 0;
`

const PositionedImage = styled.img`
  border-radius: 12px;
`

const ImageWrapper = styled(VStack)`
  position: absolute;
  top: -52.9%;
  left: 50%;
  transform: translateX(-50%);
  width: 213px;
  height: 400px;
  padding: 0px 12px 16px 12px;
  box-shadow:
    0px -1.071px 4.283px 0px rgba(255, 255, 255, 0.2) inset,
    -2.142px 0px 5.14px -3.212px rgba(255, 255, 255, 0.4) inset;
  border-radius: 36.834px;

  @media (${mediaQuery.tabletDeviceAndUp}) {
    top: -45%;
  }
`

const ContentWrapper = styled(VStack)`
  padding-inline: 16px;
`

const ButtonWrapper = styled(VStack)`
  align-self: center;

  ${mediaQuery.tabletDeviceAndUp} {
    align-self: stretch;
  }
`
