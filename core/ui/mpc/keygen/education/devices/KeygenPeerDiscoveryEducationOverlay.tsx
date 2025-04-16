import { Animation } from '@lib/ui/animations/Animation'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { GradientText, Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const KeygenPeerDiscoveryEducationOverlay: FC<OnFinishProp> = ({
  onFinish,
}) => {
  const { t } = useTranslation()

  return (
    <OverlayWrapper justifyContent="flex-end">
      <OverlayContent alignItems="center">
        <OverlayContentWrapper justifyContent="center" gap={36}>
          <PhoneImageWrapper>
            <PhoneImageOverlay />
            <img src="/assets/images/vultisig-peak.svg" alt="" />
            <RiveWrapper>
              <Animation value="keygen-secure-vault/pulse" />
            </RiveWrapper>
          </PhoneImageWrapper>
          <VStack gap={12} justifyContent="center">
            <Text centerHorizontally size={32} weight={500} color="contrast">
              {t('scanThe')}{' '}
              <GradientText as="span">{t('qrCode')}</GradientText>
            </Text>
            <Text centerHorizontally size={14} weight={500} color="supporting">
              {t('downloadVultisig')}
            </Text>
          </VStack>
          <Button onClick={onFinish}>{t('next')}</Button>
        </OverlayContentWrapper>
      </OverlayContent>
    </OverlayWrapper>
  )
}

const OverlayContent = styled(VStack)`
  background-color: ${getColor('foregroundDark')};
`

const OverlayContentWrapper = styled(VStack)`
  padding: 0px 35px 48px 35px;
  background-color: ${getColor('foreground')};
  max-width: 800px;
`

const RiveWrapper = styled.div`
  position: absolute;
  top: 181px;
  left: 160px;
  z-index: 3;
  width: 60px;
  height: 60px;
`

const PhoneImageOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(42, 83, 150, 0.08);
`

const OverlayWrapper = styled(VStack)`
  position: fixed;
  width: 100%;
  height: 100%;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
`

const PhoneImageWrapper = styled(VStack)`
  position: relative;
  border-bottom-left-radius: 44px;
  border-bottom-right-radius: 44px;
  object-fit: contain;
  width: 600px;
  height: 450px;
  overflow: hidden;
  box-shadow:
    0px -1.284px 5.136px 0px rgba(255, 255, 255, 0.2) inset,
    -2.568px 0px 6.163px -3.852px rgba(255, 255, 255, 0.4) inset;
  padding: 0px 24px 24px 24px;
  background-color: ${getColor('foregroundExtra')};

  & > img {
    margin-top: -50px;
  }
`
