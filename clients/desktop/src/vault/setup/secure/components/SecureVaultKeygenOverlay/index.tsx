import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { GradientText, Text } from '@lib/ui/text'
import { useRive } from '@rive-app/react-canvas'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import {
  OverlayContent,
  OverlayContentWrapper,
  OverlayWrapper,
  PhoneImageOverlay,
  PhoneImageWrapper,
  RiveWrapper,
} from './SecureVaultKeygenOverlay.styled'

type Props = {
  onCompleted?: () => void
}

export const SecureVaultKeygenOverlay: FC<Props> = ({ onCompleted }) => {
  const { t } = useTranslation()
  const { RiveComponent } = useRive({
    src: '/assets/animations/keygen-secure-vault/pulse.riv',
    autoplay: true,
  })

  return (
    <OverlayWrapper justifyContent="flex-end">
      <OverlayContent alignItems="center">
        <OverlayContentWrapper justifyContent="center" gap={36}>
          <PhoneImageWrapper>
            <PhoneImageOverlay />
            <img src="/assets/images/vultisig-peak.svg" alt="" />
            <RiveWrapper>
              <RiveComponent />
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
          <Button onClick={onCompleted}>{t('next')}</Button>
        </OverlayContentWrapper>
      </OverlayContent>
    </OverlayWrapper>
  )
}
