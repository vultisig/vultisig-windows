import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { BrowserExtensionIcon } from '@lib/ui/icons/BrowserExtensionIcon'
import { DeviceIcon } from '@lib/ui/icons/DeviceIcon'
import { LaptopIcon } from '@lib/ui/icons/LaptopIcon'
import { SmartphoneIcon } from '@lib/ui/icons/SmartphoneIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnBackProp, OnFinishProp, SvgProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Fit, Layout, useRive } from '@rive-app/react-webgl2'
import {
  isServer,
  parseLocalPartyId,
} from '@vultisig/core-mpc/devices/localPartyId'
import {
  DeviceType,
  formatMpcDeviceName,
  getMpcDeviceType,
} from '@vultisig/core-mpc/devices/MpcDevice'
import { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const FallbackDeviceIcon: FC<SvgProps> = props => <DeviceIcon {...props} />

const deviceTypeIconRecord: Record<DeviceType, FC<SvgProps>> = {
  phone: SmartphoneIcon,
  tablet: SmartphoneIcon,
  desktop: LaptopIcon,
  browser: BrowserExtensionIcon,
  server: FallbackDeviceIcon,
  sdk: FallbackDeviceIcon,
}

type ReviewVaultDevicesScreenProps = OnFinishProp & Partial<OnBackProp>

export const ReviewVaultDevicesScreen = ({
  onFinish,
  onBack,
}: ReviewVaultDevicesScreenProps) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()

  const { rive, RiveComponent } = useRive({
    src: '/core/animations/review-devices.riv',
    stateMachines: ['State Machine 1'],
    autoplay: true,
    layout: new Layout({ fit: Fit.Layout }),
  })

  useEffect(() => {
    if (!rive) return
    rive.resizeDrawingSurfaceToCanvas()

    const onResize = () => {
      rive.resizeDrawingSurfaceToCanvas()
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [rive])

  const userSigners = vault.signers.filter(s => !isServer(s))
  const deviceItems = userSigners.map((signer, index) => {
    const { deviceName, hash } = parseLocalPartyId(signer)
    const formattedName = formatMpcDeviceName(deviceName)
    const deviceType = getMpcDeviceType(deviceName)
    const isCurrentDevice = signer === vault.localPartyId
    const IconComponent = deviceType
      ? deviceTypeIconRecord[deviceType]
      : FallbackDeviceIcon

    return {
      signer,
      name: isCurrentDevice
        ? `${formattedName} ${t('this_device_suffix')}`
        : formattedName,
      hash,
      deviceNumber: index + 1,
      IconComponent,
    }
  })

  return (
    <Container fullHeight>
      <AnimationWrapper>
        <AnimationContainer>
          <RiveComponent />
        </AnimationContainer>
      </AnimationWrapper>
      <ContentSection>
        <VStack gap={8} alignItems="center">
          <Text size={22} weight={500} color="contrast" centerHorizontally>
            {t('review_your_vault_devices')}
          </Text>
          <Text size={14} weight={500} color="shy" centerHorizontally>
            {t('review_vault_devices_subtitle')}
          </Text>
        </VStack>
        <DeviceList>
          {deviceItems.map(
            ({ signer, name, hash, deviceNumber, IconComponent }) => (
              <DeviceCard key={signer}>
                <DeviceIconCircle>
                  <IconComponent style={{ fontSize: 16 }} />
                </DeviceIconCircle>
                <DeviceInfo>
                  <Text color="contrast" size={14} weight={500}>
                    {name}
                  </Text>
                  <Text color="shy" size={12} weight={500}>
                    {t('device_n_label', { number: deviceNumber, hash })}
                  </Text>
                </DeviceInfo>
              </DeviceCard>
            )
          )}
        </DeviceList>
        <VStack gap={12} alignItems="center">
          <Button onClick={onFinish}>{t('looks_good')}</Button>
          {onBack && (
            <Button kind="link" onClick={onBack}>
              {t('somethings_wrong')}
            </Button>
          )}
        </VStack>
      </ContentSection>
    </Container>
  )
}

const Container = styled(PageContent)`
  align-items: center;
`

const AnimationWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  width: 100%;
  overflow: hidden;
`

const AnimationContainer = styled.div`
  width: 100%;
  max-width: 500px;
  aspect-ratio: 500 / 350;
  position: relative;
  overflow: hidden;

  canvas {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain;
  }
`

const ContentSection = styled(VStack)`
  width: min(500px, 100%);
  padding: 0 24px 24px;
  flex-shrink: 0;
  gap: 32px;
`

const DeviceList = styled(VStack)`
  gap: 12px;
  width: 100%;
`

const DeviceCard = styled(HStack)`
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 24px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};
`

const DeviceIconCircle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #03132c;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.25) inset;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${getColor('info')};
`

const DeviceInfo = styled(VStack)`
  gap: 2px;
  min-width: 0;
`
