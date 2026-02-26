import { Button } from '@lib/ui/buttons/Button'
import { ArrowWallDownIcon } from '@lib/ui/icons/ArrowWallDownIcon'
import { QrCodeIcon } from '@lib/ui/icons/QrCodeIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useResponsiveness } from '../../../../providers/ResponsivenessProvider'

export const KeygenPeerDiscoveryEducationOverlay: FC<OnFinishProp> = ({
  onFinish,
}) => {
  const { t } = useTranslation()
  const { isTabletOrLarger } = useResponsiveness()

  return (
    <OverlayWrapper
      alignItems="center"
      justifyContent={isTabletOrLarger ? 'center' : 'flex-end'}
    >
      <OverlayContent justifyContent="space-between">
        <OverlayContentWrapper flexGrow justifyContent="flex-end" gap={36}>
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
                  <ImportIconBadge>
                    <ArrowWallDownIcon />
                  </ImportIconBadge>
                  <span>{t('import')}</span>
                </PhoneActionButton>
              </PhoneActionsRow>
              <PhoneMainButton>{t('get_started')}</PhoneMainButton>
            </PhoneMock>
          </PhonePreview>
          <VStack gap={12} justifyContent="center">
            <Text centerHorizontally size={17} weight={500} color="contrast">
              {t('waiting_for_devices_to_join')}
            </Text>
            <Text centerHorizontally size={14} weight={500} color="shyExtra">
              {t('waiting_for_devices_to_join_description')}
            </Text>
          </VStack>
          <OverlayButton onClick={onFinish}>{t('scan_qr')}</OverlayButton>
        </OverlayContentWrapper>
      </OverlayContent>
    </OverlayWrapper>
  )
}

const OverlayContent = styled(VStack)`
  width: min(92vw, 760px);
  height: 426px;
  border-radius: 44px;
  overflow: hidden;
  background-color: ${getColor('foreground')};
`

const OverlayContentWrapper = styled(VStack)`
  padding: 28px 40px 12px;
  position: relative;
  overflow: hidden;
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
  height: 320px;
  border-radius: 36px;
  background: linear-gradient(180deg, #082956 0%, #041b3d 100%);
  box-shadow:
    0 1px 6px rgba(255, 255, 255, 0.16) inset,
    0 -10px 28px rgba(0, 0, 0, 0.32) inset;
  align-self: center;
  min-width: 300px;

  position: absolute;
  top: -32%;

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
  background-color: #00183d;
  border: 4px solid rgba(73, 113, 177, 0.62);
  box-shadow:
    0 1px 0 rgba(164, 195, 255, 0.06) inset,
    0 -2px 16px rgba(120, 162, 235, 0.12) inset,
    0 10px 24px rgba(0, 0, 0, 0.3);
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
  width: 18px;
  height: 18px;
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
    width: 10px;
    height: 10px;
  }

  span {
    line-height: 1;
  }
`

const ImportIconBadge = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(160, 175, 206, 0.35);
  color: #0b1630;

  svg {
    width: 8px;
    height: 8px;
  }
`

const PhoneMainButton = styled.div`
  width: 100%;
  height: 52px;
  border-radius: 999px;
  background-color: #1f44ad;
  color: rgba(198, 214, 255, 0.38);
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
