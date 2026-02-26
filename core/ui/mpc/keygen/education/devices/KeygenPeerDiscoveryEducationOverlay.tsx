import { Button } from '@lib/ui/buttons/Button'
import { FolderUploadIcon } from '@lib/ui/icons/FolderUploadIcon'
import { QrCodeIcon } from '@lib/ui/icons/QrCodeIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const KeygenPeerDiscoveryEducationOverlay: FC<OnFinishProp> = ({
  onFinish,
}) => {
  const { t } = useTranslation()

  return (
    <OverlayWrapper alignItems="center" justifyContent="center">
      <OverlayContent justifyContent="space-between">
        <OverlayContentWrapper justifyContent="center" gap={36}>
          <PhonePreview>
            <PhoneMock>
              <PhoneNotch />
              <PhoneAvatar />
              <PhoneActionsRow>
                <PhoneActionButton $isPrimary>
                  <QrCodeIcon />
                  <span>{t('scan_qr')}</span>
                </PhoneActionButton>
                <PhoneActionButton>
                  <FolderUploadIcon />
                  <span>{t('import')}</span>
                </PhoneActionButton>
              </PhoneActionsRow>
              <PhoneMainButton>{t('get_started')}</PhoneMainButton>
            </PhoneMock>
          </PhonePreview>
          <VStack gap={12} justifyContent="center">
            <Text centerHorizontally size={42} weight={500} color="contrast">
              {t('scanThe')} {t('qrCode')} on your other devices
            </Text>
            <Text centerHorizontally size={14} weight={500} color="shyExtra">
              On your other device, open the app and tap {`"${t('scan_qr')}"`}{' '}
              to connect it.
            </Text>
          </VStack>
          <OverlayButton onClick={onFinish}>Start scanning</OverlayButton>
        </OverlayContentWrapper>
        <HomeIndicator />
      </OverlayContent>
    </OverlayWrapper>
  )
}

const OverlayContent = styled(VStack)`
  width: min(92vw, 760px);
  min-height: 680px;
  max-height: 92vh;
  border-radius: 44px;
  overflow: hidden;
  background-color: ${getColor('foreground')};

  @media ${mediaQuery.tabletDeviceAndUp} {
    min-height: 760px;
  }
`

const OverlayContentWrapper = styled(VStack)`
  padding: 28px 40px 12px;
`

const OverlayWrapper = styled(VStack)`
  position: fixed;
  width: 100%;
  height: 100%;
  inset: 0;
  padding: 24px;
  background-color: rgba(0, 0, 0, 0.55);
`

const PhonePreview = styled(VStack)`
  width: 100%;
  height: 320px;
  border-radius: 36px;
  background: linear-gradient(180deg, #0a2f62 0%, #062248 100%);
  box-shadow:
    0 1px 6px rgba(255, 255, 255, 0.25) inset,
    0 -4px 24px rgba(0, 0, 0, 0.2) inset;
  padding: 22px 24px 24px;

  @media ${mediaQuery.tabletDeviceAndUp} {
    height: 380px;
  }
`

const PhoneMock = styled(VStack)`
  position: relative;
  width: min(100%, 430px);
  height: 100%;
  align-self: center;
  border-radius: 34px;
  background-color: #021f46;
  border: 2px solid rgba(65, 105, 167, 0.55);
  box-shadow:
    0 -2px 10px rgba(255, 255, 255, 0.14) inset,
    0 8px 30px rgba(0, 0, 0, 0.28);
  padding: 20px 22px;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
`

const PhoneNotch = styled.div`
  position: absolute;
  top: 14px;
  width: 64px;
  height: 10px;
  border-radius: 999px;
  background-color: rgba(146, 160, 188, 0.5);
`

const PhoneAvatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background-color: rgba(155, 170, 196, 0.85);
`

const PhoneActionsRow = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`

const PhoneActionButton = styled.div<{ $isPrimary?: boolean }>`
  height: 44px;
  border-radius: 999px;
  display: grid;
  align-items: center;
  justify-content: center;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  gap: 8px;
  background-color: ${({ $isPrimary }) =>
    $isPrimary ? 'rgba(70, 96, 179, 0.9)' : 'rgba(35, 56, 114, 0.65)'};
  color: ${({ $isPrimary }) =>
    $isPrimary ? '#d4def3' : 'rgba(160, 175, 206, 0.65)'};
  font-size: 12px;
  font-weight: 500;

  svg {
    width: 14px;
    height: 14px;
  }

  span {
    line-height: 1;
  }
`

const PhoneMainButton = styled.div`
  width: 100%;
  height: 52px;
  border-radius: 999px;
  background-color: rgba(35, 56, 114, 0.85);
  color: rgba(110, 130, 178, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;

  @media ${mediaQuery.tabletDeviceAndUp} {
    font-size: 16px;
  }
`

const OverlayButton = styled(Button)`
  width: min(100%, 360px);
  align-self: center;
`

const HomeIndicator = styled.div`
  width: 140px;
  height: 8px;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.95);
  align-self: center;
  margin-bottom: 14px;
`
